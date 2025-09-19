from typing import Optional
from sqlmodel import Field
from sqlalchemy import UniqueConstraint
from .User import Usuario

class Administrador(Usuario, table=True):
    __tablename__ = "administradores"
    __table_args__ = (
        UniqueConstraint("id_admin", name="uq_administradores_id_admin"),
    )

    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")

    id_admin: int = Field(index=True)
    nivel_acceso: int

    __mapper_args__ = {"polymorphic_identity": "administrador"}