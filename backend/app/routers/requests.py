from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import traceback

from app.database import get_db
from app.models.user import User, UserRole
from app.models.request import Request, RequestStatus, RequestCategory, RequestHistory, STATUS_TRANSITIONS
from app.models.house import House
from app.schemas.request import (
    RequestCreate, RequestUpdate, RequestStatusUpdate,
    RequestResponse, RequestListResponse, CATEGORY_LABELS, STATUS_LABELS
)
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/requests", tags=["Заявки"])


def request_to_response(request: Request, user: User = None) -> RequestResponse:
    """Преобразование модели в response с дополнительными данными"""
    response = RequestResponse.model_validate(request)
    
    if user or request.user:
        u = user or request.user
        response.user_name = u.full_name
        if u.house:
            response.user_address = u.house.address
        response.user_apartment = u.apartment
    
    return response


@router.get("", response_model=RequestListResponse)
async def get_requests(
    status: Optional[RequestStatus] = None,
    category: Optional[RequestCategory] = None,
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список заявок.
    Жильцы видят только свои заявки.
    Сотрудники УК видят заявки домов своей УК.
    """
    query = select(Request).options(
        selectinload(Request.user).selectinload(User.house),
        selectinload(Request.history)
    )
    count_query = select(func.count(Request.id))
    
    # Фильтрация по роли
    if user.role == UserRole.RESIDENT:
        query = query.where(Request.user_id == user.id)
        count_query = count_query.where(Request.user_id == user.id)
    elif user.role in [UserRole.ADMIN, UserRole.DISPATCHER]:
        # Заявки от жильцов домов этой УК
        if user.company_id:
            subquery = select(User.id).join(House).where(House.company_id == user.company_id)
            query = query.where(Request.user_id.in_(subquery))
            count_query = count_query.where(Request.user_id.in_(subquery))
    
    # Фильтры
    if status:
        query = query.where(Request.status == status)
        count_query = count_query.where(Request.status == status)
    
    if category:
        query = query.where(Request.category == category)
        count_query = count_query.where(Request.category == category)
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    result = await db.execute(
        query.offset(skip).limit(limit).order_by(Request.created_at.desc())
    )
    requests = result.scalars().all()
    
    return RequestListResponse(
        items=[request_to_response(r) for r in requests],
        total=total
    )


@router.get("/categories")
async def get_categories():
    """Получить список категорий заявок"""
    return [
        {"value": cat.value, "label": label}
        for cat, label in CATEGORY_LABELS.items()
    ]


@router.get("/statuses")
async def get_statuses():
    """Получить список статусов заявок"""
    return [
        {"value": st.value, "label": label}
        for st, label in STATUS_LABELS.items()
    ]


@router.get("/{request_id}", response_model=RequestResponse)
async def get_request(
    request_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить заявку по ID"""
    result = await db.execute(
        select(Request)
        .options(
            selectinload(Request.user).selectinload(User.house),
            selectinload(Request.history)
        )
        .where(Request.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Проверка доступа
    if user.role == UserRole.RESIDENT and request.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этой заявке"
        )
    
    return request_to_response(request)


@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    data: RequestCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создать новую заявку"""
    # Проверяем, что пользователь привязан к дому
    if not user.house_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сначала укажите свой адрес в профиле"
        )
    
    request = Request(
        user_id=user.id,
        **data.model_dump()
    )
    db.add(request)
    await db.commit()
    
    # Создаем запись в истории
    history = RequestHistory(
        request_id=request.id,
        old_status=None,
        new_status=RequestStatus.NEW,
        comment="Заявка создана",
        changed_by=user.id
    )
    db.add(history)
    await db.commit()
    
    await db.refresh(request)
    
    # Загружаем связанные данные
    result = await db.execute(
        select(Request)
        .options(
            selectinload(Request.user).selectinload(User.house),
            selectinload(Request.history)
        )
        .where(Request.id == request.id)
    )
    request = result.scalar_one()
    
    return request_to_response(request)


@router.patch("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: int,
    data: RequestUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить заявку (только для автора)"""
    result = await db.execute(select(Request).where(Request.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    if request.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно редактировать только свои заявки"
        )
    
    if request.status != RequestStatus.NEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можно редактировать только новые заявки"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(request, field, value)
    
    await db.commit()
    await db.refresh(request)
    
    return request_to_response(request)


@router.post("/{request_id}/status", response_model=RequestResponse)
async def update_request_status(
    request_id: int,
    data: RequestStatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Изменить статус заявки.
    Жильцы могут только переоткрыть выполненную заявку.
    Сотрудники УК могут менять статус согласно FSM.
    """
    result = await db.execute(
        select(Request)
        .options(
            selectinload(Request.user).selectinload(User.house),
            selectinload(Request.history)
        )
        .where(Request.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    # Проверка прав
    if user.role == UserRole.RESIDENT:
        if request.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет доступа к этой заявке"
            )
        # Жильцы могут только переоткрывать или отменять свои заявки
        if data.status not in [RequestStatus.REOPENED, RequestStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы можете только отменить или переоткрыть заявку"
            )
    
    # Проверка FSM
    if not request.can_transition_to(data.status):
        allowed = STATUS_TRANSITIONS.get(request.status, [])
        allowed_labels = [STATUS_LABELS[s] for s in allowed]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Невозможно изменить статус. Допустимые переходы: {', '.join(allowed_labels) or 'нет'}"
        )
    
    old_status = request.status
    request.status = data.status
    
    # Записываем в историю
    history = RequestHistory(
        request_id=request.id,
        old_status=old_status,
        new_status=data.status,
        comment=data.comment,
        changed_by=user.id
    )
    db.add(history)
    
    try:
        await db.commit()
        await db.refresh(request)
    except Exception as e:
        print(f"ERROR in update_request_status: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    
    return request_to_response(request)


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить заявку (только для автора, только новые)"""
    result = await db.execute(select(Request).where(Request.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена"
        )
    
    if request.user_id != user.id and user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно удалять только свои заявки"
        )
    
    if request.status != RequestStatus.NEW and user.role == UserRole.RESIDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Можно удалять только новые заявки"
        )
    
    await db.delete(request)
    await db.commit()
