from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from config.database import Base

class Classification(Base):
    __tablename__ = "clasificacion"

    id = Column(Integer, primary_key=True, index=True)
    contribuyente_id = Column(Integer, ForeignKey("contribuyente.id"), nullable=False)
    nivel_probabilidad = Column(String(20), nullable=False)
    score = Column(Float, nullable=False)
    fecha_clasificacion = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), nullable=False) 