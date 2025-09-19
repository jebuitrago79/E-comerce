from typing import Optional
from sqlmodel import Field
from .User import Usuario

class Administrador(Usuario, table=True):
    __tablename__ = "administradores"

    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")
    nivel_acceso: int

    __mapper_args__ = {"polymorphic_identity": "administrador"}