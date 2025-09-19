from typing import Optional
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String

class EstadoCuenta(str, Enum):
    activo = "activo"
    bloqueado = "bloqueado"

class UsuarioBase(SQLModel):
    nombre: str
    email: str
    password: str
    estado_cuenta: EstadoCuenta = EstadoCuenta.activo

class Usuario(UsuarioBase, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    fecha_registro: datetime = Field(default_factory=datetime.utcnow)

    tipo: str = Field(sa_column=Column(String, nullable=False, index=True))

    __mapper_args__ = {
        "polymorphic_on": "tipo",
        "polymorphic_identity": "usuario",
    }
