from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint
from .common import UserFields

class Administrador(UserFields, table=True):
    __tablename__ = "administradores"
    __table_args__ = (
        UniqueConstraint("id_admin", name="uq_admin_id_admin"),
        UniqueConstraint("email", name="uq_admin_email"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    id_admin: int = Field(index=True)
    nivel_acceso: int = Field(default=1, ge=1)