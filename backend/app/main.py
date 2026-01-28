from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.routers import auth, companies, houses, requests, superadmin
from app.models import Company, House, User, UserRole
from app.utils.migration import run_auto_migration


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: создаем таблицы и накатываем миграции
    await init_db()
    await run_auto_migration()
    yield
    # Shutdown


app = FastAPI(
    title="УК Заявки API",
    description="API для системы учета заявок управляющих компаний",
    version="1.0.0",
    lifespan=lifespan
)

# CORS для фронтенда - разрешаем все origins для упрощения
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(houses.router, prefix="/api")
app.include_router(requests.router, prefix="/api")
app.include_router(superadmin.router, prefix="/api")


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


@app.post("/api/seed")
async def seed_database():
    """Заполнить БД тестовыми данными (вызывать один раз!)"""
    async with AsyncSessionLocal() as db:
        # Проверяем, есть ли уже данные
        from sqlalchemy import select
        result = await db.execute(select(Company))
        if result.first():
            return {"status": "already_seeded", "message": "База уже содержит данные"}
        
        # Создаем УК
        companies_data = [
            {"name": "УК Комфорт", "phone": "+7 (495) 123-45-67", "email": "info@comfort-uk.ru"},
            {"name": "Жилсервис Плюс", "phone": "+7 (495) 987-65-43", "email": "contact@zhilservice.ru"},
            {"name": "Домоуправление №1", "phone": "+7 (495) 555-12-34", "email": "dom1@mail.ru"},
        ]
        
        created_companies = []
        for data in companies_data:
            company = Company(**data)
            db.add(company)
            created_companies.append(company)
        
        await db.commit()
        
        for company in created_companies:
            await db.refresh(company)
        
        # Создаем дома
        houses_data = [
            {"company_id": created_companies[0].id, "address": "ул. Ленина, д. 10", "apartment_count": 120},
            {"company_id": created_companies[0].id, "address": "ул. Ленина, д. 12", "apartment_count": 80},
            {"company_id": created_companies[0].id, "address": "пр. Мира, д. 25", "apartment_count": 200},
            {"company_id": created_companies[1].id, "address": "ул. Пушкина, д. 5", "apartment_count": 60},
            {"company_id": created_companies[1].id, "address": "ул. Гагарина, д. 15", "apartment_count": 100},
            {"company_id": created_companies[2].id, "address": "ул. Советская, д. 1", "apartment_count": 150},
            {"company_id": created_companies[2].id, "address": "ул. Советская, д. 3", "apartment_count": 150},
        ]
        
        for data in houses_data:
            db.add(House(**data))
        
        await db.commit()
        
        # Создаем админа и диспетчера
        admin = User(
            telegram_id=100000001,
            username="uk_admin",
            first_name="Иван",
            last_name="Администратор",
            role=UserRole.ADMIN,
            company_id=created_companies[0].id
        )
        db.add(admin)
        
        dispatcher = User(
            telegram_id=100000002,
            username="uk_dispatcher",
            first_name="Мария",
            last_name="Диспетчер",
            role=UserRole.DISPATCHER,
            company_id=created_companies[0].id
        )
        db.add(dispatcher)
        
        # Super Admin
        super_admin = User(
            telegram_id=383094701,
            username="super_admin",
            first_name="Супер",
            last_name="Администратор",
            role=UserRole.SUPER_ADMIN
        )
        db.add(super_admin)
        
        await db.commit()
        
        return {
            "status": "success",
            "message": "База заполнена тестовыми данными",
            "created": {
                "companies": len(companies_data),
                "houses": len(houses_data),
                "admin_telegram_id": 100000001,
                "dispatcher_telegram_id": 100000002
            }
        }

