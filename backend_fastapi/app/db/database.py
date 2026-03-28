from collections.abc import AsyncGenerator
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()


def _normalize_database_url(url: str) -> str:
    normalized = url
    if normalized.startswith("postgresql://"):
        normalized = normalized.replace("postgresql://", "postgresql+asyncpg://", 1)

    if not normalized.startswith("postgresql+asyncpg://"):
        return normalized

    parts = urlsplit(normalized)
    query_params = dict(parse_qsl(parts.query, keep_blank_values=True))

    # asyncpg accepts `ssl`, while many managed DB URLs provide `sslmode`.
    if "sslmode" in query_params and "ssl" not in query_params:
        query_params["ssl"] = query_params["sslmode"]
    query_params.pop("sslmode", None)

    # Not used by asyncpg connect kwargs.
    query_params.pop("channel_binding", None)

    rebuilt_query = urlencode(query_params)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, rebuilt_query, parts.fragment))

engine = None
SessionLocal = None

if settings.database_url:
    normalized_database_url = _normalize_database_url(settings.database_url)
    engine = create_async_engine(
        normalized_database_url,
        pool_pre_ping=True,
        echo=False,
    )
    SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        raise HTTPException(
            status_code=500,
            detail="DATABASE_URL not configured. Set it in backend_fastapi/.env or project .env",
        )
    async with SessionLocal() as session:
        yield session
