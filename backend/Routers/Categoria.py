# backend/Routers/Categoria.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from sqlmodel import Session, select
from backend.db.engine import get_session
from backend.Modelos.Categoria import Categoria, CategoriaCreate, CategoriaUpdate, CategoriaRead

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.get("/", response_model=List[CategoriaRead])
def listar_categorias(
    q: Optional[str] = Query(None, description="Búsqueda por nombre (ILIKE)"),
    session: Session = Depends(get_session)
):
    stmt = select(Categoria)
    if q:
        stmt = stmt.where(Categoria.nombre.ilike(f"%{q}%"))
    return session.exec(stmt).all()

@router.post("/", response_model=CategoriaRead)
def crear_categoria(data: CategoriaCreate, session: Session = Depends(get_session)):
    # Slug único (opcional; quita si no lo necesitas)
    existe = session.exec(select(Categoria).where(Categoria.slug == data.slug)).first()
    if existe:
        raise HTTPException(status_code=400, detail="El slug ya existe.")

    cat = Categoria(
        tenant_id=1,  # si todavía no manejas tenants desde el front, deja 1 por ahora
        slug=data.slug.strip(),
        nombre=data.nombre.strip(),
        descripcion=(data.descripcion or None),
    )
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, session: Session = Depends(get_session)):
    cat = session.get(Categoria, categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return cat

@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, session: Session = Depends(get_session)
):
    cat = session.get(Categoria, categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    if data.slug:
        # si cambias slug, valida duplicados
        existe = session.exec(select(Categoria).where(Categoria.slug == data.slug, Categoria.id != categoria_id)).first()
        if existe:
            raise HTTPException(status_code=400, detail="El slug ya existe.")

    if data.slug is not None:
        cat.slug = data.slug.strip()
    if data.nombre is not None:
        cat.nombre = data.nombre.strip()
    if data.descripcion is not None:
        cat.descripcion = data.descripcion

    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, session: Session = Depends(get_session)):
    cat = session.get(Categoria, categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(cat)
    session.commit()
    return {"ok": True}
