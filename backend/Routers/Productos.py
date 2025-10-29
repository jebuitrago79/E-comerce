# backend/Routers/Productos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from sqlmodel import Session, SQLModel
from backend.db.engine import get_session
from backend.Modelos.Producto import Producto
from backend.CRUD.Crud_Producto import (
    crear_producto as crud_crear_producto,
    obtener_productos as crud_obtener_productos,
    obtener_producto_por_id as crud_obtener_producto_por_id,
    actualizar_producto as crud_actualizar_producto,
    eliminar_producto as crud_eliminar_producto,
)

router = APIRouter(prefix="/productos", tags=["Productos"])

class ProductoBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None

class ProductoCreate(ProductoBase):
    tenant_id: Optional[int] = 1

class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None
    tenant_id: Optional[int] = None

class ProductoRead(ProductoBase):
    id: int
    tenant_id: Optional[int] = None

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    session: Session = Depends(get_session),
    nombre: Optional[str] = Query(None),
    precio_min: Optional[float] = Query(None),
    precio_max: Optional[float] = Query(None),
    category_id: Optional[int] = Query(None),
):
    productos = crud_obtener_productos(session)

    def ok(p: Producto) -> bool:
        if nombre and nombre.lower() not in (p.nombre or "").lower(): return False
        if precio_min is not None and (p.precio or 0) < precio_min: return False
        if precio_max is not None and (p.precio or 0) > precio_max: return False
        if category_id is not None and p.category_id != category_id: return False
        return True

    return [p for p in productos if ok(p)]

@router.post("/", response_model=ProductoRead, status_code=201)
def crear_producto(data: ProductoCreate, session: Session = Depends(get_session)):
    try:
        payload = data.model_dump(exclude_unset=True)
        prod = crud_crear_producto(session, payload)
        return prod
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear producto: {e}")

@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    p = crud_obtener_producto_por_id(session, producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(producto_id: int, data: ProductoUpdate, session: Session = Depends(get_session)):
    nuevos = data.model_dump(exclude_unset=True)
    p = crud_obtener_producto_por_id(session, producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return crud_actualizar_producto(session, producto_id, nuevos)

@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(producto_id: int, session: Session = Depends(get_session)):
    ok = crud_eliminar_producto(session, producto_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
