# backend/Routers/Categoria.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import SQLModel, Field, Session, select
from backend.db.engine import get_session
from backend.Modelos.Categoria import Categoria  # <-- solo el modelo de BD

router = APIRouter(prefix="/categorias", tags=["Categorias"])

# ========= DTOs (Schemas) =========
class CategoriaBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None

class CategoriaRead(CategoriaBase):
    id: int

# ========= Endpoints =========
@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(payload: CategoriaCreate, session: Session = Depends(get_session)):
    # Validar nombre único si agregaste UniqueConstraint en el modelo
    existe = session.exec(select(Categoria).where(Categoria.nombre == payload.nombre)).first()
    if existe:
        raise HTTPException(status_code=400, detail="La categoría ya existe")

    obj = Categoria(nombre=payload.nombre, descripcion=payload.descripcion)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return CategoriaRead.model_validate(obj, from_attributes=True)

@router.get("/", response_model=List[CategoriaRead])
def listar_categorias(
    session: Session = Depends(get_session),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    q: Optional[str] = Query(None, description="Filtro por nombre (contains)"),
):
    stmt = select(Categoria).offset(offset).limit(limit)
    if q:
        # Filtro “contains” (lado Python para compatibilidad cross-DB)
        rows = session.exec(stmt).all()
        rows = [c for c in rows if q.lower() in c.nombre.lower()]
    else:
        rows = session.exec(stmt).all()
    return [CategoriaRead.model_validate(c, from_attributes=True) for c in rows]

@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, session: Session = Depends(get_session)):
    obj = session.get(Categoria, categoria_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return CategoriaRead.model_validate(obj, from_attributes=True)

@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, payload: CategoriaUpdate, session: Session = Depends(get_session)
):
    obj = session.get(Categoria, categoria_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    data = payload.model_dump(exclude_unset=True)

    # Si se cambia el nombre, validar unicidad
    nuevo_nombre = data.get("nombre")
    if nuevo_nombre and nuevo_nombre != obj.nombre:
        conflict = session.exec(select(Categoria).where(Categoria.nombre == nuevo_nombre)).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    for k, v in data.items():
        setattr(obj, k, v)

    session.add(obj)
    session.commit()
    session.refresh(obj)
    return CategoriaRead.model_validate(obj, from_attributes=True)

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, session: Session = Depends(get_session)):
    obj = session.get(Categoria, categoria_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(obj)
    session.commit()
    return
