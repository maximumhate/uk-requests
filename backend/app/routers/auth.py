from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, TokenResponse
from app.utils.auth import verify_telegram_data, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Авторизация"])


@router.post("/telegram", response_model=TokenResponse)
async def auth_telegram(
    init_data: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Авторизация через Telegram Mini App
    
    Принимает init_data из Telegram WebApp и возвращает JWT токен
    """
    # Проверяем данные от Telegram
    user_data = verify_telegram_data(init_data)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверные данные авторизации"
        )
    
    telegram_id = user_data.get("id")
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Отсутствует ID пользователя"
        )
    
    # Ищем или создаем пользователя
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            telegram_id=telegram_id,
            username=user_data.get("username"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Обновляем данные пользователя
        user.username = user_data.get("username") or user.username
        user.first_name = user_data.get("first_name") or user.first_name
        user.last_name = user_data.get("last_name") or user.last_name
        await db.commit()
        await db.refresh(user)
    
    # Создаем токен
    access_token = create_access_token({"telegram_id": telegram_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/demo", response_model=TokenResponse)
async def auth_demo(
    telegram_id: int = 123456789,
    db: AsyncSession = Depends(get_db)
):
    """
    Демо-авторизация для тестирования (только в режиме debug)
    """
    from app.config import settings
    if not settings.debug:
        raise HTTPException(status_code=404, detail="Not found")
    
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            telegram_id=telegram_id,
            username="demo_user",
            first_name="Демо",
            last_name="Пользователь",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    access_token = create_access_token({"telegram_id": telegram_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(
    telegram_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Вход для сотрудников УК по Telegram ID
    Работает только для пользователей с ролью admin или dispatcher
    """
    from app.models.user import UserRole
    
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Разрешаем вход админам, диспетчерам и суперадминам
    # Используем .value для надежного сравнения значений Enum
    user_role_val = user.role.value if hasattr(user.role, 'value') else str(user.role).lower()
    allowed_roles = [UserRole.ADMIN.value, UserRole.DISPATCHER.value, UserRole.SUPER_ADMIN.value]
    
    if user_role_val not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Доступ разрешён только сотрудникам УК (Ваша роль: {user_role_val})"
        )
    
    access_token = create_access_token({"telegram_id": telegram_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Получить текущего пользователя"""
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить данные текущего пользователя"""
    update_data = data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.post("/make-admin")
async def make_admin(
    telegram_id: int = 123456789,
    company_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Сделать пользователя админом УК по telegram_id (только в debug режиме)
    """
    from app.config import settings
    if not settings.debug:
        raise HTTPException(status_code=404, detail="Not found")
    
    from app.models.user import UserRole
    
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.role = UserRole.ADMIN
    user.company_id = company_id
    
    await db.commit()
    await db.refresh(user)
    
    return {"message": f"Пользователь {user.first_name} теперь админ УК #{company_id}"}
