from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.house import House
from app.models.company import Company
from app.schemas.house import HouseCreate, HouseUpdate, HouseResponse, HouseListResponse

router = APIRouter(prefix="/houses", tags=["Дома"])


@router.get("", response_model=HouseListResponse)
async def get_houses(
    company_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить список домов (опционально фильтр по УК)"""
    query = select(House)
    count_query = select(func.count(House.id))
    
    if company_id:
        query = query.where(House.company_id == company_id)
        count_query = count_query.where(House.company_id == company_id)
    
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    result = await db.execute(
        query.offset(skip).limit(limit).order_by(House.address)
    )
    houses = result.scalars().all()
    
    return HouseListResponse(
        items=[HouseResponse.model_validate(h) for h in houses],
        total=total
    )


@router.get("/{house_id}", response_model=HouseResponse)
async def get_house(
    house_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Получить дом по ID"""
    result = await db.execute(select(House).where(House.id == house_id))
    house = result.scalar_one_or_none()
    
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Дом не найден"
        )
    
    return HouseResponse.model_validate(house)


@router.post("", response_model=HouseResponse, status_code=status.HTTP_201_CREATED)
async def create_house(
    data: HouseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Создать новый дом"""
    # Проверяем, что УК существует
    result = await db.execute(select(Company).where(Company.id == data.company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="УК не найдена"
        )
    
    house = House(**data.model_dump())
    db.add(house)
    await db.commit()
    await db.refresh(house)
    
    return HouseResponse.model_validate(house)


@router.patch("/{house_id}", response_model=HouseResponse)
async def update_house(
    house_id: int,
    data: HouseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Обновить дом"""
    result = await db.execute(select(House).where(House.id == house_id))
    house = result.scalar_one_or_none()
    
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Дом не найден"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(house, field, value)
    
    await db.commit()
    await db.refresh(house)
    
    return HouseResponse.model_validate(house)


@router.delete("/{house_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_house(
    house_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Удалить дом"""
    result = await db.execute(select(House).where(House.id == house_id))
    house = result.scalar_one_or_none()
    
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Дом не найден"
        )
    
    await db.delete(house)
    await db.commit()
