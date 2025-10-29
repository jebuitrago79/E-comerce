# backend/Modelos/Producto.py
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer, Float, String, ForeignKey

class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: Optional[int] = 1

    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    category_id: Optional[int] = None

    # La FK DEBE referenciar vendedores.id (PK real)
    vendedor_id: Optional[int] = Field(
        default=None,
        sa_column=Column("vendedor_id", Integer, ForeignKey("vendedores.id", ondelete="SET NULL"))
    )

    # relación
    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")

