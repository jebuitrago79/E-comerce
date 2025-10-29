# Routers/categorias.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from backend.db.engine import get_session
from backend.Modelos.Categoria import (
    Categoria, CategoriaCreate, CategoriaUpdate, CategoriaRead
)

router = APIRouter(
    prefix="/tenants/{tenant_id}/categorias",
    tags=["categorias"]
)

def _slug_exists(db: Session, tenant_id: int, slug: str, exclude_id: int | None = None) -> bool:
    stmt = select(Categoria).where(
        Categoria.tenant_id == tenant_id,
        Categoria.slug == slug
    )
    cat = db.exec(stmt).first()
    if not cat:
        return False
    if exclude_id and cat.id == exclude_id:
        return False
    return True


@router.post("", response_model=CategoriaRead)
def crear_categoria(
    tenant_id: int,
    data: CategoriaCreate,
    db: Session = Depends(get_session)
):
    if _slug_exists(db, tenant_id, data.slug):
        raise HTTPException(status_code=400, detail="El slug ya existe para este tenant.")

    cat = Categoria(
        tenant_id=tenant_id,
        slug=data.slug.strip(),
        nombre=data.nombre.strip(),
        descripcion=(data.descripcion or None),
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    tenant_id: int,
    q: str | None = None,
    db: Session = Depends(get_session)
):
    stmt = select(Categoria).where(Categoria.tenant_id == tenant_id)
    if q:
        stmt = stmt.where(Categoria.nombre.ilike(f"%{q}%"))
    return db.exec(stmt).all()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    tenant_id: int,
    categoria_id: int,
    db: Session = Depends(get_session)
):
    cat = db.get(Categoria, categoria_id)
    if not cat or cat.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    return cat


@router.get("/by-slug/{slug}", response_model=CategoriaRead)
def obtener_por_slug(
    tenant_id: int,
    slug: str,
    db: Session = Depends(get_session)
):
    stmt = select(Categoria).where(
        Categoria.tenant_id == tenant_id,
        Categoria.slug == slug
    )
    cat = db.exec(stmt).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    return cat


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    tenant_id: int,
    categoria_id: int,
    data: CategoriaUpdate,
    db: Session = Depends(get_session)
):
    cat = db.get(Categoria, categoria_id)
    if not cat or cat.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")

    if data.slug and _slug_exists(db, tenant_id, data.slug, exclude_id=cat.id):
        raise HTTPException(status_code=400, detail="El slug ya existe para este tenant.")

    if data.slug is not None:
        cat.slug = data.slug.strip()
    if data.nombre is not None:
        cat.nombre = data.nombre.strip()
    if data.descripcion is not None:
        cat.descripcion = data.descripcion

    cat.updated_at = datetime.utcnow()
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{categoria_id}")
def eliminar_categoria(
    tenant_id: int,
    categoria_id: int,
    db: Session = Depends(get_session)
):
    cat = db.get(Categoria, categoria_id)
    if not cat or cat.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    db.delete(cat)
    db.commit()
    return {"ok": True}
