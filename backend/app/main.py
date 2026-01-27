from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.routers import auth, companies, houses, requests


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: создаем таблицы
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title="УК Заявки API",
    description="API для системы учета заявок управляющих компаний",
    version="1.0.0",
    lifespan=lifespan
)

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        settings.app_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(houses.router, prefix="/api")
app.include_router(requests.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "УК Заявки API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
