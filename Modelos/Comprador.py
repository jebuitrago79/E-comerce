from typing import Optional
from sqlmodel import Field
from sqlalchemy import UniqueConstraint
from .User import Usuario

class Comprador(Usuario, table=True):
    __tablename__ = "compradores"
    __table_args__ = (
        UniqueConstraint("id_comprador", name="uq_compradores_id_comprador"),
    )

    id: Optional[int] = Field(default=None, primary_key=True, foreign_key="usuarios.id")

    id_comprador: int = Field(index=True)

    __mapper_args__ = {"polymorphic_identity": "comprador"}