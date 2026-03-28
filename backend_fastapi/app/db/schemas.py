from datetime import datetime

from pydantic import BaseModel, Field


class ComplaintBase(BaseModel):
    transcript: str = Field(min_length=1)
    language_code: str | None = None
    language_name: str | None = None
    urgency_level: str | None = None
    urgency_score: float | None = None
    keywords: str | None = None
    department_assigned: str | None = None
    department_confidence: float | None = None


class ComplaintCreate(ComplaintBase):
    session_id: str | None = None


class ComplaintUpdate(BaseModel):
    transcript: str | None = None
    language_code: str | None = None
    language_name: str | None = None
    urgency_level: str | None = None
    urgency_score: float | None = None
    keywords: str | None = None
    department_assigned: str | None = None
    department_confidence: float | None = None


class ComplaintOut(ComplaintBase):
    id: int
    session_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintLogCreate(BaseModel):
    action: str
    status: str


class ComplaintLogOut(BaseModel):
    id: int
    complaint_id: int | None = None
    session_id: str
    action: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintRouteOut(BaseModel):
    id: int
    session_id: str
    department: str
    route_confidence: float | None = None
    routing_keywords: str | None = None
    routed_at: datetime

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    complaint_id: int
    action: str
    actor: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ComplaintStatsOut(BaseModel):
    total: int
    high_urgency: int
    resolved: int
    pending: int


class MessageOut(BaseModel):
    message: str


class SchemeOut(BaseModel):
    id: int
    scheme_name: str
    scheme_slug: str | None = None
    ministry: str | None = None
    department: str | None = None
    description: str | None = None
    benefits: str | None = None
    eligibility: str | None = None
    application_process: str | None = None
    documents_required: list[str] | None = None
    scheme_type: str | None = None
    target_beneficiaries: list[str] | None = None
    state: str | None = None
    website_url: str | None = None
    tags: list[str] | None = None

    class Config:
        from_attributes = True
