from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HouseCreate(BaseModel):
    company_id: int
    address: str
    apartment_count: Optional[int] = None


class HouseUpdate(BaseModel):
    address: Optional[str] = None
    apartment_count: Optional[int] = None


class HouseResponse(BaseModel):
    id: int
    company_id: int
    address: str
    apartment_count: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class HouseListResponse(BaseModel):
    items: List[HouseResponse]
    total: int
