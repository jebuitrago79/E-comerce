# backend/Modelos/Tienda.py
from __future__ import annotations

from typing import Optional
from datetime import datetime

from sqlmodel import SQLModel, Field


class Tienda(SQLModel, table=True):
    __tablename__ = "tiendas"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    vendedor_id: int = Field(
        foreign_key="vendedores.id",
        index=True,
        unique=True,
        description="ID del vendedor dueño de la tienda",
    )

    nombre_negocio: str
    descripcion: Optional[str] = None
    color_primario: Optional[str] = None
    logo_url: Optional[str] = None
    slug: str = Field(index=True, unique=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # ❌ SIN Relationship
    # Igual podemos obtener el vendedor por vendedor_id cuando haga falta

