from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session  # adjust import as needed
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionRead, TransactionSummary
from app.auth.users import current_active_user
from app.models import User
from decimal import Decimal
from fastapi import UploadFile, File
import csv
from io import StringIO
from datetime import datetime

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)

@router.get("/", response_model=list[TransactionRead])
async def list_transactions(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    result = await session.execute(
        select(Transaction).where(Transaction.user_id == user.id)
    )
    transactions = result.scalars().all()
    return [TransactionRead.from_orm(t) for t in transactions]

@router.get("/summary", response_model=TransactionSummary)
async def list_transactions_summary(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    result = await session.execute(
        select(
            func.sum(Transaction.usd_spent).label("total_usd_spent"),
            func.sum(Transaction.btc_bought).label("total_btc_bought"),
            func.avg(Transaction.btc_price).label("avg_btc_price")
        ).where(Transaction.user_id == user.id)
    )
    row = result.first()
    if not row or row.total_usd_spent is None or row.total_btc_bought is None:
        return TransactionSummary(
            total_usd_spent=Decimal("0.00"),
            total_btc_bought=Decimal("0.00"),
            avg_btc_price=Decimal("0.00")
        )
    return TransactionSummary(
        total_usd_spent=row.total_usd_spent, # type: ignore
        total_btc_bought=Decimal(row.total_btc_bought) / Decimal("100000000"), # type: ignore
        avg_btc_price=row.avg_btc_price # type: ignore
    )

@router.post("/", response_model=TransactionRead)
async def create_transaction(
    tx: TransactionCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    transaction = Transaction(**tx.dict(), user_id=user.id)
    session.add(transaction)
    await session.commit()
    await session.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}", response_model=TransactionRead)
async def delete_transaction(
    transaction_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    result = await session.execute(
        select(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == user.id
        )
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await session.delete(transaction)
    await session.commit()
    return transaction

@router.post("/import_csv", response_model=list[TransactionRead])
async def import_transactions_csv(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(StringIO(decoded))
    created_transactions = []

    for row in reader:
        try:
            date = datetime.strptime(row["Date"], "%Y-%m-%d").date()
            usd_spent = Decimal(row["USD Spent"].replace("$", "").replace(",", "").strip())
            btc_price = Decimal(row["BTC Price in USD"].replace("$", "").replace(",", "").strip())
            btc_bought = Decimal(row["BTC Bought"].replace("₿", "").replace(",", "").strip()) * Decimal("100000000")  # Convert to satoshis
        except Exception as e:
            continue  # skip malformed rows

        # Check if transaction for this date and user exists
        result = await session.execute(
            select(Transaction).where(Transaction.user_id == user.id, Transaction.date == date)
        )
        transaction = result.scalars().first()
        if transaction:
            transaction.usd_spent = usd_spent # type: ignore
            transaction.btc_price = btc_price # type: ignore
            transaction.btc_bought = btc_bought # type: ignore
        else:
            transaction = Transaction(
                user_id=user.id,
                date=date,
                usd_spent=usd_spent,
                btc_price=btc_price,
                btc_bought=btc_bought,
            )
            session.add(transaction)
        await session.flush()
        await session.refresh(transaction)
        created_transactions.append(TransactionRead.from_orm(transaction))

    await session.commit()
    return created_transactions