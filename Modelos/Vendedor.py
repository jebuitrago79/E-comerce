from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint, Column
from sqlalchemy import Enum as SAEnum
from .common import EstadoCuenta


class Vendedor(SQLModel, table=True):
    __tablename__ = "vendedores"
    __table_args__ = (UniqueConstraint("id_vendedor", name="uq_vendedores_id_vendedor"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    id_vendedor: int = Field(index=True)
    nombre: str = Field(max_length=100)
    empresa: str = Field(max_length=100)
    direccion: str = Field(max_length=255)
    telefono: str = Field(max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    password: str = Field(max_length=255)

    estado_cuenta: EstadoCuenta = Field(
        default=EstadoCuenta.activo,
        sa_column=Column(
            SAEnum(EstadoCuenta, name="estadocuenta_vendedores"),
            nullable=False,
            server_default=EstadoCuenta.activo.value,
        )
    )

    productos: Optional[List["Producto"]] = Relationship(back_populates="vendedor")
