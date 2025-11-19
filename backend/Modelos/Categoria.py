# backend/Modelos/Categoria.py
from __future__ import annotations

from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    __table_args__ = (UniqueConstraint("nombre", name="uq_categorias_nombre"),)

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None

    # Nada de Relationship aquí
    # productos: List["Producto"] = Relationship(back_populates="categoria")
