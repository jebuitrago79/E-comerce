from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .Vendedor import Vendedor
    from .Categoria import Categoria

class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(index=True)

    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)
    precio: float
    stock: int = Field(default=0)

    category_id: Optional[int] = Field(default=None, foreign_key="categorias.id")

    external_id: Optional[str] = Field(default=None, index=True)
    source: Optional[str] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # 👇 FK debe referir a 'vendedores.id_vendedor'
    vendedor_id: Optional[int] = Field(default=None, foreign_key="vendedores.id_vendedor")

    categoria: Optional["Categoria"] = Relationship()
    vendedor: Optional["Vendedor"] = Relationship(back_populates="productos")


