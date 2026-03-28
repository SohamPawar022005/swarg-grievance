from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.db.models import AuditLog, Complaint, ComplaintLog, ComplaintRoute
from app.db.schemas import (
    AuditLogOut,
    ComplaintCreate,
    ComplaintLogCreate,
    ComplaintLogOut,
    ComplaintOut,
    ComplaintRouteOut,
    ComplaintStatsOut,
    ComplaintUpdate,
)

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.get("", response_model=list[ComplaintOut])
async def list_complaints(
    department: str | None = Query(default=None),
    urgency: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> list[Complaint]:
    query: Select[tuple[Complaint]] = select(Complaint)

    if department:
        query = query.where(Complaint.department_assigned.ilike(f"%{department}%"))
    if urgency:
        query = query.where(Complaint.urgency_level.ilike(urgency))

    query = query.order_by(Complaint.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/search", response_model=list[ComplaintOut])
async def search_complaints(
    q: str = Query(min_length=1),
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db_session),
) -> list[Complaint]:
    query = (
        select(Complaint)
        .where(
            or_(
                Complaint.session_id.ilike(f"%{q}%"),
                Complaint.transcript.ilike(f"%{q}%"),
                Complaint.keywords.ilike(f"%{q}%"),
                Complaint.department_assigned.ilike(f"%{q}%"),
            )
        )
        .order_by(Complaint.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/stats", response_model=ComplaintStatsOut)
async def complaint_stats(db: AsyncSession = Depends(get_db_session)) -> ComplaintStatsOut:
    total_query = select(func.count(Complaint.id))
    high_query = select(func.count(Complaint.id)).where(
        func.lower(Complaint.urgency_level).in_(["high", "emergency"])
    )
    resolved_query = select(func.count(ComplaintLog.id)).where(
        func.lower(ComplaintLog.status) == "resolved"
    )
    pending_query = select(func.count(Complaint.id)).where(
        or_(Complaint.department_assigned.is_(None), Complaint.department_assigned == "")
    )

    total = (await db.execute(total_query)).scalar_one()
    high = (await db.execute(high_query)).scalar_one()
    resolved = (await db.execute(resolved_query)).scalar_one()
    pending = (await db.execute(pending_query)).scalar_one()

    return ComplaintStatsOut(total=total, high_urgency=high, resolved=resolved, pending=pending)


@router.get("/{session_id}", response_model=ComplaintOut)
async def get_complaint_by_session_id(
    session_id: str, db: AsyncSession = Depends(get_db_session)
) -> Complaint:
    result = await db.execute(
        select(Complaint).where(Complaint.session_id == session_id).limit(1)
    )
    complaint = result.scalar_one_or_none()
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.get("/{session_id}/logs", response_model=list[ComplaintLogOut])
async def get_complaint_logs(
    session_id: str, db: AsyncSession = Depends(get_db_session)
) -> list[ComplaintLog]:
    result = await db.execute(
        select(ComplaintLog)
        .where(ComplaintLog.session_id == session_id)
        .order_by(ComplaintLog.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{session_id}/route", response_model=ComplaintRouteOut | None)
async def get_complaint_route(
    session_id: str, db: AsyncSession = Depends(get_db_session)
) -> ComplaintRoute | None:
    result = await db.execute(
        select(ComplaintRoute)
        .where(ComplaintRoute.session_id == session_id)
        .order_by(ComplaintRoute.routed_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/{complaint_id}/audit-logs", response_model=list[AuditLogOut])
async def get_audit_logs(
    complaint_id: int, db: AsyncSession = Depends(get_db_session)
) -> list[AuditLog]:
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.complaint_id == complaint_id)
        .order_by(AuditLog.timestamp.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=ComplaintOut, status_code=201)
async def create_complaint(
    payload: ComplaintCreate, db: AsyncSession = Depends(get_db_session)
) -> Complaint:
    generated_session_id = payload.session_id or f"GRV-{datetime.utcnow().year}-{uuid4().hex[:8].upper()}"

    complaint = Complaint(
        session_id=generated_session_id,
        transcript=payload.transcript,
        language_code=payload.language_code,
        language_name=payload.language_name,
        urgency_level=payload.urgency_level,
        urgency_score=payload.urgency_score,
        keywords=payload.keywords,
        department_assigned=payload.department_assigned,
        department_confidence=payload.department_confidence,
    )

    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)

    db.add(
        ComplaintLog(
            session_id=complaint.session_id,
            action="Created complaint",
            status="pending",
        )
    )
    await db.commit()

    return complaint


@router.put("/{session_id}", response_model=ComplaintOut)
async def update_complaint_by_session_id(
    session_id: str,
    payload: ComplaintUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> Complaint:
    result = await db.execute(
        select(Complaint).where(Complaint.session_id == session_id).limit(1)
    )
    complaint = result.scalar_one_or_none()
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(complaint, key, value)

    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.post("/{session_id}/logs", response_model=ComplaintLogOut, status_code=201)
async def add_complaint_log(
    session_id: str,
    payload: ComplaintLogCreate,
    db: AsyncSession = Depends(get_db_session),
) -> ComplaintLog:
    result = await db.execute(
        select(Complaint).where(Complaint.session_id == session_id).limit(1)
    )
    complaint = result.scalar_one_or_none()
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")

    log = ComplaintLog(
        session_id=session_id,
        action=payload.action,
        status=payload.status,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
