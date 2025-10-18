from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column
from sqlalchemy import Enum as SAEnum
from .common import UserFields, EstadoCuenta

class Administrador(UserFields, table=True):
    __tablename__ = "administradores"
    __table_args__ = (UniqueConstraint("email", name="uq_admin_email"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    id_admin: int = Field(index=True)
    nivel_acceso: str

    estado_cuenta: EstadoCuenta = Field(
        default=EstadoCuenta.activo,
        sa_column=Column(
            SAEnum(EstadoCuenta, name="estadocuenta_administradores"),
            nullable=False,
            server_default=EstadoCuenta.activo.value,
        ),
    )
