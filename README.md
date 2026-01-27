# УК Заявки - Система учета заявок для управляющих компаний

Веб-приложение + Telegram Mini App для подачи и отслеживания заявок жильцами.

## 🚀 Быстрый старт

### 1. Создайте Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте бота: `/newbot`
3. Сохраните токен бота

### 2. Настройте переменные окружения

```bash
# Скопируйте и отредактируйте .env
cp backend/.env.example .env
```

Заполните:
- `TELEGRAM_BOT_TOKEN` — токен от BotFather
- `JWT_SECRET_KEY` — случайная строка для JWT
- `APP_URL` — URL вашего сайта

### 3. Запустите через Docker

```bash
docker-compose up -d --build
```

Приложение будет доступно:
- Frontend: http://localhost
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Структура проекта

```
YK/
├── backend/           # FastAPI сервер
│   ├── app/
│   │   ├── models/    # SQLAlchemy модели
│   │   ├── routers/   # API endpoints
│   │   ├── schemas/   # Pydantic схемы
│   │   └── utils/     # Утилиты (auth, etc)
│   └── Dockerfile
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/     # Страницы
│   │   ├── components/# UI компоненты
│   │   └── context/   # Auth context
│   └── Dockerfile
└── docker-compose.yml
```

## 🛠️ Локальная разработка

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📱 Telegram Mini App

Для настройки Mini App:

1. В @BotFather: `/mybots` → ваш бот → `Bot Settings` → `Menu Button`
2. Укажите URL: `https://your-domain.com`

Или через `/newapp`:
1. `/mybots` → ваш бот → `Configure Mini App`
2. Укажите URL приложения

## 🔑 Роли пользователей

- **resident** — жилец (создает заявки)
- **dispatcher** — диспетчер УК (обрабатывает заявки)
- **admin** — администратор УК (полный доступ)

## 📊 API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/telegram | Авторизация через TG |
| GET | /api/auth/me | Текущий пользователь |
| GET | /api/companies | Список УК |
| GET | /api/houses | Список домов |
| GET | /api/requests | Список заявок |
| POST | /api/requests | Создать заявку |
| POST | /api/requests/{id}/status | Изменить статус |

Полная документация: `/docs` (Swagger UI)

## 📝 Лицензия

MIT
