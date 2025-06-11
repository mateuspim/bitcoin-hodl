from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session  # adjust import as needed
from app.models import Transaction
from app.schemas import TransactionCreate, TransactionRead
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
    return result.scalars().all()

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