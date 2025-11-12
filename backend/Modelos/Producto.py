# backend/Modelos/Producto.py
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    tenant_id: int = Field(default=1, index=True)  # <-- default explícito e index
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int

    vendedor_id: int = Field(foreign_key="vendedores.id", index=True)  # <-- FK al PK del vendedor
    category_id: Optional[int] = Field(default=None, foreign_key="categorias.id", index=True)

    external_id: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")



