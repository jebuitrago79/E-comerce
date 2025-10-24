# Modelos/common.py
from enum import Enum
from sqlmodel import SQLModel

class EstadoCuenta(str, Enum):
    activo = "activo"
    bloqueado = "bloqueado"

class UserFields(SQLModel):
    nombre: str
    email: str
    password: str
