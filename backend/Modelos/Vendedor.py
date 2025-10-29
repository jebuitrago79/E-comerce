# backend/Modelos/Vendedor.py
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Integer, String

if TYPE_CHECKING:
    from .Producto import Producto


class Vendedor(SQLModel, table=True):
    __tablename__ = "vendedores"

    # Clave primaria manual (sin autoincrement)
    id_vendedor: int = Field(
        sa_column=Column("id_vendedor", Integer, primary_key=True, autoincrement=False)
    )

    nombre: str
    email: str
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    password: str

    # si prefieres Enum, cámbialo a tu Enum y la sa_column a Enum(...)
    estado_cuenta: str = Field(
        default="activo",
        sa_column=Column("estado_cuenta", String, nullable=False)
    )

    productos: List["Producto"] = Relationship(back_populates="vendedor")


