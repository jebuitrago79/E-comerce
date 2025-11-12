# backend/Modelos/Categoria.py
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint

class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    __table_args__ = (UniqueConstraint("nombre", name="uq_categorias_nombre"),)  # <-- NUEVO

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None

    productos: List["Producto"] = Relationship(back_populates="categoria")
