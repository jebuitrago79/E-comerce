# backend/Modelos/Vendedor.py
from __future__ import annotations

from typing import Optional
from datetime import datetime

from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from backend.Modelos.common import EstadoCuenta


class Vendedor(SQLModel, table=True):
    __tablename__ = "vendedores"
    __table_args__ = (
        UniqueConstraint("id_vendedor", name="uq_vendedores_id_vendedor"),
        UniqueConstraint("email", name="uq_vendedores_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    id_vendedor: int = Field(index=True, description="ID manual visible del negocio")
    nombre: str
    email: str
    password: str
    estado_cuenta: EstadoCuenta = Field(default=EstadoCuenta.activo)
    telefono: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # ❌ SIN relaciones ORM aquí
    # productos y tienda los manejamos via consultas usando vendedor.id
