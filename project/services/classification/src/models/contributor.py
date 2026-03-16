from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base

class Contributor(Base):
    __tablename__ = "contribuyente"

    id = Column(Integer, primary_key=True, index=True)
    documento = Column(String(20), nullable=False)
    tipo_documento = Column(String(10), nullable=False)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True) 