from decimal import Decimal
from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from fastapi_users import schemas
import uuid
from uuid import UUID as UUIDType

# Transaction Schemas
class TransactionBase(BaseModel):
    date: date
    usd_spent: Decimal
    btc_price: Decimal
    btc_bought: int  # satoshis

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    btc_bought: Decimal # type: ignore

    @classmethod
    def from_orm(cls, obj):
        data = obj.__dict__.copy()
        data["btc_bought"] = Decimal(obj.btc_bought) / Decimal("100000000")
        return cls(**data)
    
    class Config:
        orm_mode = True
        
class TransactionSummary(BaseModel):
    total_usd_spent: Decimal | None
    total_btc_bought: Decimal | None  # sum of satoshis in BTC
    avg_btc_price: Decimal | None

# User schemas
class UserRead(schemas.BaseUser[uuid.UUID]):
    username: str

class UserCreate(schemas.BaseUserCreate):
    username: str


class UserUpdate(schemas.BaseUserUpdate):
    pass

# Bitcoin Schemas
class BitcoinPriceResponse(BaseModel):
    currency: str
    price: Decimal
    cached: bool = False  # Optional, default to False
