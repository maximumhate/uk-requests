from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.company import Company
from app.models.house import House
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse

router = APIRouter(prefix="/companies", tags=["Управляющие компании"])


@router.get("", response_model=CompanyListResponse)
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех УК"""
    # Считаем общее количество
    count_result = await db.execute(select(func.count(Company.id)))
    total = count_result.scalar()
    
    # Получаем компании с количеством домов
    result = await db.execute(
        select(Company)
        .offset(skip)
        .limit(limit)
        .order_by(Company.name)
    )
    companies = result.scalars().all()
    
    items = []
    for company in companies:
        # Считаем дома
        house_count_result = await db.execute(
            select(func.count(House.id)).where(House.company_id == company.id)
        )
        house_count = house_count_result.scalar()
        
        response = CompanyResponse.model_validate(company)
        response.house_count = house_count
        items.append(response)
    
    return CompanyListResponse(items=items, total=total)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Получить УК по ID"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="УК не найдена"
        )
    
    # Считаем дома
    house_count_result = await db.execute(
        select(func.count(House.id)).where(House.company_id == company.id)
    )
    house_count = house_count_result.scalar()
    
    response = CompanyResponse.model_validate(company)
    response.house_count = house_count
    return response


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db)
):
    """Создать новую УК"""
    company = Company(**data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    
    response = CompanyResponse.model_validate(company)
    response.house_count = 0
    return response


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Обновить УК"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="УК не найдена"
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    await db.commit()
    await db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Удалить УК"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="УК не найдена"
        )
    
    await db.delete(company)
    await db.commit()
