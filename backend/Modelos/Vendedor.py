# backend/Modelos/Vendedor.py
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer, String, UniqueConstraint

if TYPE_CHECKING:
    from .Producto import Producto

class Vendedor(SQLModel, table=True):
    __tablename__ = "vendedores"

    # PK real en la BD
    id: Optional[int] = Field(
        default=None,
        sa_column=Column("id", Integer, primary_key=True, autoincrement=True)
    )

    # ID manual de negocio (único, NO PK)
    id_vendedor: int = Field(
        sa_column=Column("id_vendedor", Integer, nullable=False, unique=True)
    )

    nombre: str
    email: str
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    password: str

    estado_cuenta: str = Field(
        default="activo",
        sa_column=Column("estado_cuenta", String, nullable=False)
    )

    productos: List["Producto"] = Relationship(back_populates="vendedor")

    # (opcional) si quieres asegurar unicidad adicional por ORM:
    __table_args__ = (
        UniqueConstraint("id_vendedor", name="uq_vendedores_id_vendedor"),
    )

