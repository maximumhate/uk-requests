from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Database - Railway sets DATABASE_URL automatically for PostgreSQL
    # Falls back to SQLite for local development
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./uk_requests.db"
    ).replace("postgres://", "postgresql+asyncpg://").replace("postgresql://", "postgresql+asyncpg://")
    
    # Telegram
    telegram_bot_token: str = ""
    
    # JWT
    jwt_secret_key: str = "super-secret-key-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    
    # App
    app_url: str = "http://localhost:3000"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
