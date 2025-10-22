# Modelos/Categoria.py
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(index=True)
    slug: str = Field(index=True, max_length=100)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=255)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ===== DTOs (para requests/responses) =====

class CategoriaBase(SQLModel):
    slug: str
    nombre: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(SQLModel):
    slug: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None

class CategoriaRead(CategoriaBase):
    id: int
    tenant_id: int
