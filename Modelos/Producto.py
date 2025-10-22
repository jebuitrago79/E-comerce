from sqlmodel import SQLModel, Field, Relationship, Column
from typing import Optional
from enum import Enum
from sqlalchemy import Enum as SAEnum  # 👈 Import necesario para usar ENUM en PostgreSQL


class CategoriaEnum(str, Enum):
    ropa = "ropa"
    tecnologia = "tecnologia"
    comida = "comida"
    deportes = "deportes"


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    precio: float
    stock: int = Field(default=0)

    # ⚙️ Guardamos el ENUM correctamente en la base de datos PostgreSQL
    categoria: CategoriaEnum = Field(
        sa_column=Column(SAEnum(CategoriaEnum, name="categoria_enum"), nullable=False)
    )

    vendedor_id: Optional[int] = Field(default=None, foreign_key="vendedores.id")

    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")
