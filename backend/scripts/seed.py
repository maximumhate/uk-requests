"""
Скрипт для заполнения БД тестовыми данными
Запуск: python -m scripts.seed
"""
import asyncio
from app.database import AsyncSessionLocal, init_db
from app.models import Company, House, User, UserRole


async def seed():
    # Инициализация таблиц
    await init_db()
    
    async with AsyncSessionLocal() as db:
        # Создаем тестовые УК
        companies_data = [
            {"name": "УК Комфорт", "phone": "+7 (495) 123-45-67", "email": "info@comfort-uk.ru"},
            {"name": "Жилсервис Плюс", "phone": "+7 (495) 987-65-43", "email": "contact@zhilservice.ru"},
            {"name": "Домоуправление №1", "phone": "+7 (495) 555-12-34", "email": "dom1@mail.ru"},
        ]
        
        companies = []
        for data in companies_data:
            company = Company(**data)
            db.add(company)
            companies.append(company)
        
        await db.commit()
        
        # Обновляем объекты после коммита
        for company in companies:
            await db.refresh(company)
        
        # Создаем дома
        houses_data = [
            # УК Комфорт
            {"company_id": companies[0].id, "address": "ул. Ленина, д. 10", "apartment_count": 120},
            {"company_id": companies[0].id, "address": "ул. Ленина, д. 12", "apartment_count": 80},
            {"company_id": companies[0].id, "address": "пр. Мира, д. 25", "apartment_count": 200},
            # Жилсервис Плюс
            {"company_id": companies[1].id, "address": "ул. Пушкина, д. 5", "apartment_count": 60},
            {"company_id": companies[1].id, "address": "ул. Гагарина, д. 15", "apartment_count": 100},
            # Домоуправление №1
            {"company_id": companies[2].id, "address": "ул. Советская, д. 1", "apartment_count": 150},
            {"company_id": companies[2].id, "address": "ул. Советская, д. 3", "apartment_count": 150},
        ]
        
        for data in houses_data:
            house = House(**data)
            db.add(house)
        
        await db.commit()
        
        # Создаем тестового админа УК
        admin = User(
            telegram_id=100000001,
            username="uk_admin",
            first_name="Иван",
            last_name="Администратор",
            role=UserRole.ADMIN,
            company_id=companies[0].id
        )
        db.add(admin)
        
        # Создаем тестового диспетчера
        dispatcher = User(
            telegram_id=100000002,
            username="uk_dispatcher",
            first_name="Мария",
            last_name="Диспетчер",
            role=UserRole.DISPATCHER,
            company_id=companies[0].id
        )
        db.add(dispatcher)
        
        await db.commit()
        
        print("✅ База данных успешно заполнена тестовыми данными!")
        print(f"   - Создано {len(companies_data)} УК")
        print(f"   - Создано {len(houses_data)} домов")
        print(f"   - Создан админ (telegram_id: 100000001)")
        print(f"   - Создан диспетчер (telegram_id: 100000002)")


if __name__ == "__main__":
    asyncio.run(seed())
