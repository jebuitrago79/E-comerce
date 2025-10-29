# backend/Routers/Productos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from sqlmodel import Session, SQLModel, select
from backend.db.engine import get_session
from backend.Modelos.Producto import Producto
from backend.Modelos.Vendedor import Vendedor
from backend.CRUD.Crud_Producto import (
    crear_producto as crud_crear_producto,
    obtener_productos as crud_obtener_productos,
    obtener_producto_por_id as crud_obtener_producto_por_id,
    actualizar_producto as crud_actualizar_producto,
    eliminar_producto as crud_eliminar_producto,
)

router = APIRouter(prefix="/productos", tags=["Productos"])

# helper: convierte id_vendedor (manual) -> id (PK)
def _resolver_pk_vendedor(session: Session, id_vendedor_manual: Optional[int]) -> Optional[int]:
    if id_vendedor_manual is None:
        return None
    vend = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor_manual)
    ).first()
    if not vend:
        raise HTTPException(status_code=400, detail=f"vendedor_id {id_vendedor_manual} no existe")
    return vend.id  # ← ahora sí existe

class ProductoBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None   # <- del front llega el id_vendedor (manual)

class ProductoCreate(ProductoBase):
    tenant_id: Optional[int] = 1

class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None   # <- también aquí llega id_vendedor (manual)
    tenant_id: Optional[int] = None

class ProductoRead(ProductoBase):
    id: int
    tenant_id: Optional[int] = None

# ✅ GET LIST
@router.get("/", response_model=List[Producto])
def listar_productos(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(Producto).offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.post("/", response_model=ProductoRead, status_code=201)
def crear_producto(data: ProductoCreate, session: Session = Depends(get_session)):
    try:
        payload = data.model_dump(exclude_unset=True)
        if "vendedor_id" in payload and payload["vendedor_id"] is not None:
            payload["vendedor_id"] = _resolver_pk_vendedor(session, payload["vendedor_id"])
        prod = crud_crear_producto(session, payload)
        return prod
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear producto: {e}")

@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(producto_id: int, data: ProductoUpdate, session: Session = Depends(get_session)):
    p = crud_obtener_producto_por_id(session, producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    nuevos = data.model_dump(exclude_unset=True)
    if "vendedor_id" in nuevos:
        if nuevos["vendedor_id"] is None:
            pass  # desasociar (NULL)
        else:
            nuevos["vendedor_id"] = _resolver_pk_vendedor(session, nuevos["vendedor_id"])

    return crud_actualizar_producto(session, producto_id, nuevos)