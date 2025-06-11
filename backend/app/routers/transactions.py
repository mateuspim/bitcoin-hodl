from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session  # adjust import as needed
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionRead, TransactionSummary
from app.auth.users import current_active_user
from app.models import User

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
    return TransactionSummary(
        total_usd_spent=row.total_usd_spent, # type: ignore
        total_btc_bought=row.total_btc_bought, # type: ignore
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