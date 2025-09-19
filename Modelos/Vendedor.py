from typing import Optional
from sqlmodel import Field
from .User import Usuario

class Vendedor(Usuario, table=True):
    __tablename__ = "vendedores"

    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")
    id_vendedor: Optional[int] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None

    __mapper_args__ = {"polymorphic_identity": "vendedor"}