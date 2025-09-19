from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from .common import UserFields

class Vendedor(UserFields, table=True):
    __tablename__ = "vendedores"
    __table_args__ = (
        UniqueConstraint("id_vendedor", name="uq_vendedores_id_vendedor"),
        UniqueConstraint("email", name="uq_vendedores_email"),  # opcional, útil
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    id_vendedor: int = Field(index=True)
    empresa: str
    direccion: str
    telefono: str