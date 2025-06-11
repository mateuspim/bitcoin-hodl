from sqlalchemy import Column, ForeignKey, Integer, Float, Date, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.dialects.postgresql import UUID


Base = declarative_base()

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    username = Column(String, unique=True, index=True, nullable=False)
    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)                # Purchase date
    usd_spent = Column(Float, nullable=False)           # Amount spent in USD
    btc_price = Column(Float, nullable=False)           # BTC price at purchase
    btc_bought = Column(Float, nullable=False)          # Amount of BTC bought
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="transactions")