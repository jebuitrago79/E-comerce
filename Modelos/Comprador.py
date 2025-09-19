from typing import Optional
from sqlmodel import Field
from .User import Usuario

class Comprador(Usuario, table=True):
    __tablename__ = "compradores"

    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")
    id_comprador: Optional[int] = None

    __mapper_args__ = {"polymorphic_identity": "comprador"}