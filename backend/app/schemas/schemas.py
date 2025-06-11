from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from fastapi_users import schemas
import uuid
from uuid import UUID as UUIDType

class TransactionBase(BaseModel):
    date: date
    usd_spent: float
    btc_price: float
    btc_bought: float

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    #user_id: UUIDType

    class Config:
        orm_mode = True
        
class TransactionSummary(BaseModel):
    total_usd_spent: float | None
    total_btc_bought: float | None
    avg_btc_price: float | None

class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str

class UserCreate(schemas.BaseUserCreate):
    username: str


class UserUpdate(schemas.BaseUserUpdate):
    pass

