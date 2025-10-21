# Modelos/Comprador.py
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column
from sqlalchemy import Enum as SAEnum
from .common import UserFields, EstadoCuenta


class Comprador(UserFields, table=True):
    __tablename__ = "compradores"
    __table_args__ = (
        UniqueConstraint("id_comprador", name="uq_compradores_id_comprador"),
        UniqueConstraint("email", name="uq_compradores_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    id_comprador: int = Field(index=True)
    direccion: str
    telefono: str

    estado_cuenta: EstadoCuenta = Field(
        default=EstadoCuenta.activo,
        sa_column=Column(
            SAEnum(EstadoCuenta, name="estadocuenta_compradores"),
            nullable=False,
            server_default=EstadoCuenta.activo.value,
        ),
    )
