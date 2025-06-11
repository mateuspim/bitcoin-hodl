from fastapi import APIRouter, HTTPException, Query
import httpx
import time
from app.schemas import BitcoinPriceResponse

router = APIRouter()
_price_cache = {}  # {currency: (price, timestamp)}

CACHE_SECONDS = 60

@router.get("/bitcoin/price", summary="Get current Bitcoin price", response_model=BitcoinPriceResponse)
async def get_bitcoin_price(
    currency: str = Query("usd", description="Fiat currency code, e.g. usd, eur, brl")
):
    now = time.time()
    curr = _price_cache.get(currency, None)
    if curr:
        price, ts = curr
        if now - ts < CACHE_SECONDS:
            return BitcoinPriceResponse(currency=currency, price=price, cached=True)

    url = f"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies={currency.lower()}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch price from CoinGecko")
    data = response.json()
    price = data.get("bitcoin", {}).get(currency.lower())
    if price is None:
        raise HTTPException(status_code=502, detail="Invalid response from CoinGecko")
    
    _price_cache[currency] = (price, now)
    return BitcoinPriceResponse(currency=currency, price=price, cached=False)