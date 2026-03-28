from fastapi import APIRouter, Depends, Query
from sqlalchemy import Select, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.db.models import Scheme
from app.db.schemas import SchemeOut

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("", response_model=list[SchemeOut])
async def list_schemes(
    search: str | None = Query(default=None),
    state: str | None = Query(default=None),
    ministry: str | None = Query(default=None),
    scheme_type: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> list[Scheme]:
    query: Select[tuple[Scheme]] = select(Scheme)

    if state:
        query = query.where(Scheme.state.ilike(state))
    if ministry:
        query = query.where(Scheme.ministry.ilike(f"%{ministry}%"))
    if scheme_type:
        query = query.where(Scheme.scheme_type.ilike(scheme_type))
    if search:
        term = f"%{search}%"
        query = query.where(
            or_(
                Scheme.scheme_name.ilike(term),
                Scheme.description.ilike(term),
                Scheme.tags.ilike(term),
                Scheme.target_beneficiaries.ilike(term),
            )
        )

    query = query.order_by(Scheme.scheme_name.asc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all())
