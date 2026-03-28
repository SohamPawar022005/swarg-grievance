from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/db")
async def health_db(db: AsyncSession = Depends(get_db_session)) -> dict[str, str]:
    try:
        result = await db.execute(text("SELECT NOW() AS now"))
        row = result.mappings().first()
        return {"status": "ok", "database_time": row["now"].isoformat()}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {exc}") from exc
