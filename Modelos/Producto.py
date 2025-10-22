from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from enum import Enum

class CategoriaEnum(str, Enum):
    ropa = "ropa"
    tecnologia = "tecnologia"
    comida = "comida"
    deportes = "deportes"

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    precio: float
    stock: int = Field(default=0)
    categoria: CategoriaEnum
    vendedor_id: Optional[int] = Field(default=None, foreign_key="vendedores.id")

    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")
