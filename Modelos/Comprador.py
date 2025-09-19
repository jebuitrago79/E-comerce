from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from .common import UserFields

class Comprador(UserFields, table=True):
    __tablename__ = "compradores"
    __table_args__ = (
        UniqueConstraint("id_comprador", name="uq_compradores_id_comprador"),
        UniqueConstraint("email", name="uq_compradores_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    id_comprador: int = Field(index=True)