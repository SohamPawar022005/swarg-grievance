from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load root .env and backend .env so either location works.
ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"
BACKEND_ENV = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ROOT_ENV, override=False)
load_dotenv(BACKEND_ENV, override=False)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    app_name: str = "Swarg Grievance FastAPI"
    api_prefix: str = "/api"

    api_host: str = "127.0.0.1"
    api_port: int = 5000

    database_url: str | None = None
    cors_origins: str = "http://localhost:8080,http://127.0.0.1:8080"


@lru_cache
def get_settings() -> Settings:
    return Settings()
