from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class House(Base):
    """Дом, обслуживаемый УК"""
    __tablename__ = "houses"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    address = Column(String(500), nullable=False)
    apartment_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="houses")
    residents = relationship("User", back_populates="house")
    
    def __repr__(self):
        return f"<House(id={self.id}, address='{self.address}')>"
