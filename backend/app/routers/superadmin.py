from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.house import House
from app.models.request import Request, RequestStatus, RequestHistory
from app.utils.auth import get_current_user

router = APIRouter(prefix="/superadmin", tags=["Super Admin"])


def require_super_admin(user: User = Depends(get_current_user)) -> User:
    """Require super_admin role with robust comparison"""
    role_val = user.role.value if hasattr(user.role, 'value') else str(user.role).lower()
    if role_val != UserRole.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Доступ разрешён только супер-администратору (Ваша роль: {role_val})"
        )
    return user


# ============== COMPANIES ==============

class CompanyCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


@router.get("/companies")
async def list_companies(
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all companies with stats"""
    result = await db.execute(
        select(Company).options(selectinload(Company.houses))
    )
    companies = result.scalars().all()
    
    response = []
    for company in companies:
        # Count houses and users
        house_count = len(company.houses)
        user_result = await db.execute(
            select(func.count(User.id)).where(User.company_id == company.id)
        )
        user_count = user_result.scalar() or 0
        
        response.append({
            "id": company.id,
            "name": company.name,
            "phone": company.phone,
            "email": company.email,
            "address": getattr(company, "address", None), # Safety check
            "house_count": house_count,
            "user_count": user_count,
            "created_at": company.created_at.isoformat() if company.created_at else None
        })
    
    return response


@router.post("/companies", status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new company"""
    company = Company(**data.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    
    return {
        "id": company.id,
        "name": company.name,
        "phone": company.phone,
        "email": company.email,
        "address": company.address
    }


@router.patch("/companies/{company_id}")
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update a company"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(status_code=404, detail="УК не найдена")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    await db.commit()
    await db.refresh(company)
    
    return {
        "id": company.id,
        "name": company.name,
        "phone": company.phone,
        "email": company.email,
        "address": company.address
    }


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a company"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(status_code=404, detail="УК не найдена")
    
    await db.delete(company)
    await db.commit()


# ============== HOUSES ==============

class HouseCreate(BaseModel):
    company_id: int
    address: str
    apartment_count: int = 1

class HouseUpdate(BaseModel):
    company_id: Optional[int] = None
    address: Optional[str] = None
    apartment_count: Optional[int] = None


@router.get("/houses")
async def list_houses(
    company_id: Optional[int] = None,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all houses with optional company filter"""
    query = select(House).options(selectinload(House.company))
    
    if company_id:
        query = query.where(House.company_id == company_id)
    
    result = await db.execute(query.order_by(House.id))
    houses = result.scalars().all()
    
    response = []
    for house in houses:
        # Count residents
        resident_result = await db.execute(
            select(func.count(User.id)).where(User.house_id == house.id)
        )
        resident_count = resident_result.scalar() or 0
        
        response.append({
            "id": house.id,
            "address": house.address,
            "apartment_count": house.apartment_count,
            "company_id": house.company_id,
            "company_name": house.company.name if house.company else None,
            "resident_count": resident_count,
            "created_at": house.created_at.isoformat() if house.created_at else None
        })
    
    return response


@router.post("/houses", status_code=status.HTTP_201_CREATED)
async def create_house(
    data: HouseCreate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new house"""
    # Verify company exists
    result = await db.execute(select(Company).where(Company.id == data.company_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="УК не найдена")
    
    house = House(**data.model_dump())
    db.add(house)
    await db.commit()
    await db.refresh(house)
    
    return {
        "id": house.id,
        "address": house.address,
        "apartment_count": house.apartment_count,
        "company_id": house.company_id
    }


@router.patch("/houses/{house_id}")
async def update_house(
    house_id: int,
    data: HouseUpdate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update a house"""
    result = await db.execute(select(House).where(House.id == house_id))
    house = result.scalar_one_or_none()
    
    if not house:
        raise HTTPException(status_code=404, detail="Дом не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(house, field, value)
    
    await db.commit()
    await db.refresh(house)
    
    return {
        "id": house.id,
        "address": house.address,
        "apartment_count": house.apartment_count,
        "company_id": house.company_id
    }


@router.delete("/houses/{house_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_house(
    house_id: int,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a house"""
    result = await db.execute(select(House).where(House.id == house_id))
    house = result.scalar_one_or_none()
    
    if not house:
        raise HTTPException(status_code=404, detail="Дом не найден")
    
    await db.delete(house)
    await db.commit()


# ============== USERS ==============

class UserUpdate(BaseModel):
    role: Optional[str] = None
    company_id: Optional[int] = None
    house_id: Optional[int] = None
    apartment: Optional[str] = None


@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    company_id: Optional[int] = None,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users with optional filters"""
    query = select(User).options(
        selectinload(User.house),
        selectinload(User.company)
    )
    
    if role:
        query = query.where(User.role == role)
    if company_id:
        query = query.where(User.company_id == company_id)
    
    result = await db.execute(query.order_by(User.id))
    users = result.scalars().all()
    
    response = []
    for u in users:
        response.append({
            "id": u.id,
            "telegram_id": u.telegram_id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role.value if u.role else None,
            "house_id": u.house_id,
            "house_address": u.house.address if u.house else None,
            "apartment": u.apartment,
            "company_id": u.company_id,
            "company_name": u.company.name if u.company else None,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    
    return response


@router.patch("/users/{user_id}")
async def update_user(
    user_id: int,
    data: UserUpdate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user role/company/house"""
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    update_data = data.model_dump(exclude_unset=True)
    
    if "role" in update_data:
        try:
            update_data["role"] = UserRole(update_data["role"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверная роль")
    
    for field, value in update_data.items():
        setattr(target_user, field, value)
    
    await db.commit()
    await db.refresh(target_user)
    
    return {"message": "Пользователь обновлён"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user"""
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if target_user.id == user.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить себя")
    
    await db.delete(target_user)
    await db.commit()


# ============== REQUESTS ==============

@router.post("/requests/{request_id}/cancel")
async def cancel_request(
    request_id: int,
    comment: str = "Отменено супер-администратором",
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Cancel any request (super admin only)"""
    result = await db.execute(select(Request).where(Request.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    if request.status == RequestStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Заявка уже отменена")
    
    old_status = request.status
    request.status = RequestStatus.CANCELLED
    
    # Add to history
    history = RequestHistory(
        request_id=request.id,
        old_status=old_status,
        new_status=RequestStatus.CANCELLED,
        comment=comment,
        changed_by=user.id
    )
    db.add(history)
    
    await db.commit()
    
    return {"message": "Заявка отменена"}


# ============== STATS ==============

@router.get("/stats")
async def get_stats(
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get global statistics"""
    # Companies count
    company_result = await db.execute(select(func.count(Company.id)))
    company_count = company_result.scalar() or 0
    
    # Houses count
    house_result = await db.execute(select(func.count(House.id)))
    house_count = house_result.scalar() or 0
    
    # Users count
    user_result = await db.execute(select(func.count(User.id)))
    user_count = user_result.scalar() or 0
    
    # Requests by status
    requests_by_status = {}
    for status in RequestStatus:
        result = await db.execute(
            select(func.count(Request.id)).where(Request.status == status)
        )
        requests_by_status[status.value] = result.scalar() or 0
    
    total_requests = sum(requests_by_status.values())
    
    return {
        "companies": company_count,
        "houses": house_count,
        "users": user_count,
        "requests": {
            "total": total_requests,
            "by_status": requests_by_status
        }
    }
