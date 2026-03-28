from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.complaints import router as complaints_router
from app.api.routes.health import router as health_router
from app.api.routes.schemes import router as schemes_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(complaints_router, prefix=settings.api_prefix)
app.include_router(schemes_router, prefix=settings.api_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Swarg Grievance FastAPI running"}
