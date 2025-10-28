from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer  # ✅ import correcto

if TYPE_CHECKING:
    from .Producto import Producto

class Vendedor(SQLModel, table=True):
    __tablename__ = "vendedores"

    # ⛳︎ NO pongas primary_key en Field si ya lo pones en Column
    id: Optional[int] = Field(
        default=None,
        sa_column=Column("id_vendedor", Integer, primary_key=True)  # ✅ PK aquí
    )

    nombre: str
    email: str
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    password: str
    estado_cuenta: str = "activo"

    productos: List["Producto"] = Relationship(back_populates="vendedor")

