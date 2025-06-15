from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your database models and routers here as you build them
# from . import models
from app.routers import users, transactions, bitcoin
from app.database import engine, Base, User, create_db_and_tables
from app.auth.users import current_active_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wait for DB to be ready (optional: add retry logic here)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Bitcoin HODL API",
    description="Backend for tracking Bitcoin holdings",
    version="0.1.0",
    lifespan=lifespan
)

# CORS settings for local React dev server
origins = [
    "http://localhost:3000",  # React dev server
    # Add your production frontend URL here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bitcoin Tracker API is running!"}

app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(bitcoin.router)