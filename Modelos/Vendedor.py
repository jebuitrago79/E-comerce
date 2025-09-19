from typing import Optional
from sqlmodel import Field
from .User import Usuario

class Vendedor(Usuario, table=True):
    __tablename__ = "vendedores"


    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")

    id_vendedor: int
    empresa: str
    direccion: str
    telefono: str

    __mapper_args__ = {"polymorphic_identity": "vendedor"}