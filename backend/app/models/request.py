import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database import Base


class RequestStatus(str, enum.Enum):
    """Статусы заявки (FSM)"""
    NEW = "new"                  # Новая
    ACCEPTED = "accepted"        # Принята
    IN_PROGRESS = "in_progress"  # В работе
    ON_HOLD = "on_hold"          # Приостановлена
    COMPLETED = "completed"      # Выполнена
    REJECTED = "rejected"        # Отклонена
    REOPENED = "reopened"        # Открыта повторно


class RequestCategory(str, enum.Enum):
    """Категории заявок"""
    PLUMBING = "plumbing"        # Сантехника
    ELECTRICAL = "electrical"    # Электрика
    REPAIR = "repair"            # Ремонт
    CLEANING = "cleaning"        # Уборка
    INTERCOM = "intercom"        # Домофон
    ELEVATOR = "elevator"        # Лифт
    HEATING = "heating"          # Отопление
    OTHER = "other"              # Другое


# FSM: допустимые переходы статусов
STATUS_TRANSITIONS = {
    RequestStatus.NEW: [RequestStatus.ACCEPTED, RequestStatus.REJECTED],
    RequestStatus.ACCEPTED: [RequestStatus.IN_PROGRESS, RequestStatus.REJECTED, RequestStatus.ON_HOLD],
    RequestStatus.IN_PROGRESS: [RequestStatus.COMPLETED, RequestStatus.ON_HOLD],
    RequestStatus.ON_HOLD: [RequestStatus.IN_PROGRESS, RequestStatus.REJECTED],
    RequestStatus.COMPLETED: [RequestStatus.REOPENED],
    RequestStatus.REJECTED: [],
    RequestStatus.REOPENED: [RequestStatus.ACCEPTED, RequestStatus.REJECTED],
}


class Request(Base):
    """Заявка от жильца"""
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    category = Column(Enum(RequestCategory), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    status = Column(Enum(RequestStatus), default=RequestStatus.NEW, nullable=False)
    
    # Для платных услуг (заглушка)
    is_paid = Column(Integer, default=0)  # 0 = бесплатно, >0 = цена в копейках
    payment_status = Column(String(50), nullable=True)  # pending, paid, refunded
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="requests")
    history = relationship("RequestHistory", back_populates="request", cascade="all, delete-orphan", order_by="RequestHistory.created_at")
    
    def can_transition_to(self, new_status: RequestStatus) -> bool:
        """Проверка допустимости перехода в новый статус"""
        return new_status in STATUS_TRANSITIONS.get(self.status, [])
    
    def __repr__(self):
        return f"<Request(id={self.id}, status={self.status}, category={self.category})>"


class RequestHistory(Base):
    """История изменений заявки"""
    __tablename__ = "request_history"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    
    old_status = Column(Enum(RequestStatus), nullable=True)
    new_status = Column(Enum(RequestStatus), nullable=False)
    comment = Column(Text, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    request = relationship("Request", back_populates="history")
    
    def __repr__(self):
        return f"<RequestHistory(request_id={self.request_id}, {self.old_status} -> {self.new_status})>"
