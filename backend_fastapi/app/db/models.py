from datetime import datetime

from sqlalchemy import ARRAY, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    transcript: Mapped[str] = mapped_column(Text, nullable=False)
    language_code: Mapped[str | None] = mapped_column(String(16), nullable=True)
    language_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    urgency_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    urgency_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    keywords: Mapped[str | None] = mapped_column(Text, nullable=True)
    department_assigned: Mapped[str | None] = mapped_column(String(128), nullable=True)
    department_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class ComplaintLog(Base):
    __tablename__ = "complaint_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ComplaintRoute(Base):
    __tablename__ = "complaint_routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(128), nullable=False)
    route_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    routing_keywords: Mapped[str | None] = mapped_column(Text, nullable=True)
    routed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    actor: Mapped[str] = mapped_column(String(128), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_name: Mapped[str] = mapped_column(String(255), nullable=False)
    scheme_slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ministry: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    benefits: Mapped[str | None] = mapped_column(Text, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    application_process: Mapped[str | None] = mapped_column(Text, nullable=True)
    documents_required: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    scheme_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    target_beneficiaries: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
