# backend/Modelos/Producto.py
from __future__ import annotations

from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    tenant_id: int = Field(default=1, index=True)

    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    imagen_url: Optional[str] = None
    destacado: bool = Field(default=False)

    
    vendedor_id: int = Field(foreign_key="vendedores.id", index=True)
    category_id: Optional[int] = Field(default=None, foreign_key="categorias.id", index=True)

    external_id: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # ❌ SIN Relationship aquí
    # Nos basta con vendedor_id y category_id para hacer joins/filter cuando se necesite
