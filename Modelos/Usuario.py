# modelos/usuario.py
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from .common import UserFields


class Usuario(UserFields, table=True):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("email", name="uq_usuario_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
