import enum
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    """Роли пользователей"""
    RESIDENT = "resident"      # Жилец
    ADMIN = "admin"            # Администратор УК
    DISPATCHER = "dispatcher"  # Диспетчер УК
    SUPER_ADMIN = "super_admin"  # Суперадмин системы


class User(Base):
    """Пользователь системы (жилец или сотрудник УК)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Привязка к дому
    house_id = Column(Integer, ForeignKey("houses.id", ondelete="SET NULL"), nullable=True)
    apartment = Column(String(20), nullable=True)  # Номер квартиры
    
    # Роль и привязка к УК (для сотрудников)
    role = Column(Enum(UserRole), default=UserRole.RESIDENT, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    house = relationship("House", back_populates="residents")
    requests = relationship("Request", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.last_name]
        return " ".join(p for p in parts if p) or self.username or f"User {self.telegram_id}"
    
    def __repr__(self):
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, role={self.role})>"
