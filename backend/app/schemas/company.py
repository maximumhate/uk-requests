from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    description: Optional[str]
    created_at: datetime
    house_count: int = 0
    
    class Config:
        from_attributes = True


class CompanyListResponse(BaseModel):
    items: List[CompanyResponse]
    total: int
