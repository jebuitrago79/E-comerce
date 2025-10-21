# Modelos/Vendedor.py
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column
from sqlalchemy import Enum as SAEnum
from .common import UserFields, EstadoCuenta

class Vendedor(UserFields, table=True):
    __tablename__ = "vendedores"
    __table_args__ = (
        UniqueConstraint("id_vendedor", name="uq_vendedores_id_vendedor"),
        UniqueConstraint("email", name="uq_vendedores_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    id_vendedor: int = Field(index=True)
    empresa: str
    direccion: str
    telefono: str


    estado_cuenta: EstadoCuenta = Field(
        default=EstadoCuenta.activo,
        sa_column=Column(
            SAEnum(EstadoCuenta, name="estadocuenta_vendedores"),
            nullable=False,
            server_default=EstadoCuenta.activo.value,
        ),            ),