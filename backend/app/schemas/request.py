from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.request import RequestStatus, RequestCategory


class RequestCreate(BaseModel):
    category: RequestCategory
    title: str
    description: Optional[str] = None
    is_paid: int = 0


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class RequestStatusUpdate(BaseModel):
    status: RequestStatus
    comment: Optional[str] = None


class RequestHistoryResponse(BaseModel):
    id: int
    old_status: Optional[RequestStatus]
    new_status: RequestStatus
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RequestResponse(BaseModel):
    id: int
    user_id: int
    category: RequestCategory
    title: str
    description: Optional[str]
    status: RequestStatus
    is_paid: int
    payment_status: Optional[str]
    created_at: datetime
    updated_at: datetime
    history: List[RequestHistoryResponse] = []
    
    # Дополнительные поля для отображения
    user_name: Optional[str] = None
    user_address: Optional[str] = None
    user_apartment: Optional[str] = None
    
    class Config:
        from_attributes = True


class RequestListResponse(BaseModel):
    items: List[RequestResponse]
    total: int


# Категории для фронтенда
CATEGORY_LABELS = {
    RequestCategory.PLUMBING: "Сантехника",
    RequestCategory.ELECTRICAL: "Электрика",
    RequestCategory.REPAIR: "Ремонт",
    RequestCategory.CLEANING: "Уборка",
    RequestCategory.INTERCOM: "Домофон",
    RequestCategory.ELEVATOR: "Лифт",
    RequestCategory.HEATING: "Отопление",
    RequestCategory.OTHER: "Другое",
}

STATUS_LABELS = {
    RequestStatus.NEW: "Новая",
    RequestStatus.ACCEPTED: "Принята",
    RequestStatus.IN_PROGRESS: "В работе",
    RequestStatus.ON_HOLD: "Приостановлена",
    RequestStatus.COMPLETED: "Выполнена",
    RequestStatus.REJECTED: "Отклонена",
    RequestStatus.REOPENED: "Открыта повторно",
}
