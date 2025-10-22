# Modelos/Producto.py
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# Si vas a mantener temporalmente el enum viejo para compatibilidad,
# puedes dejarlo comentado o crear una migración aparte.
# from enum import Enum
# from sqlalchemy import Enum as SAEnum, Column
# class CategoriaEnum(str, Enum):
#     ropa = "ropa"
#     tecnologia = "tecnologia"
#     comida = "comida"
#     deportes = "deportes"

class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)

    # 👇 MULTITENANT (cada cliente/tienda)
    tenant_id: int = Field(index=True)

    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    precio: float
    stock: int = Field(default=0)

    # 👇 CATEGORÍA DINÁMICA (FK a tabla categorias)
    category_id: Optional[int] = Field(default=None, foreign_key="categorias.id")

    # (Opcional) para futuras integraciones/sync
    external_id: Optional[str] = Field(default=None, index=True)
    source: Optional[str] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones
    categoria: Optional["Categoria"] = Relationship()  # relación simple a Categoria
    vendedor_id: Optional[int] = Field(default=None, foreign_key="vendedores.id")
    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")

