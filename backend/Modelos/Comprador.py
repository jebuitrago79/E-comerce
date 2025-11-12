# backend/Modelos/Comprador.py
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from backend.Modelos.common import EstadoCuenta

class Comprador(SQLModel, table=True):
    __tablename__ = "compradores"
    __table_args__ = (
        UniqueConstraint("id_comprador", name="uq_compradores_id_comprador"),
        UniqueConstraint("email", name="uq_compradores_email"),  # <-- NUEVO (recomendado)
    )

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    id_comprador: int = Field(index=True, description="ID manual visible del negocio")
    nombre: str
    email: str
    password: str
    estado_cuenta: EstadoCuenta = Field(default=EstadoCuenta.activo)
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)