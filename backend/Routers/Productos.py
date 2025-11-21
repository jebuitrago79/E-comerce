# backend/Routers/Productos.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import SQLModel, Session, select
from backend.db.engine import get_session
from backend.Modelos.Producto import Producto
from backend.Modelos.Vendedor import Vendedor


router = APIRouter(prefix="/productos", tags=["Productos"])

class ProductoBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    category_id: Optional[int] = None
    external_id: Optional[str] = None
    source: Optional[str] = None
    imagen_url: Optional[str] = None
    destacado: Optional[bool] = False 

class ProductoCreate(ProductoBase):
    id_vendedor: int  # ID manual visible que llega del front

class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    external_id: Optional[str] = None
    source: Optional[str] = None
    id_vendedor: Optional[int] = None
    imagen_url: Optional[str] = None
    destacado: Optional[bool] = None 

class ProductoRead(ProductoBase):
    id: int
    vendedor_id: int

def _resolver_vendedor_pk(session: Session, id_v_manual: int) -> int:
    v = session.exec(select(Vendedor).where(Vendedor.id_vendedor == id_v_manual)).first()
    if not v:
        raise HTTPException(status_code=400, detail="Vendedor (id_vendedor) no existe")
    return v.id

@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(payload: ProductoCreate, session: Session = Depends(get_session)):
    vendedor_pk = _resolver_vendedor_pk(session, payload.id_vendedor)
    obj = Producto(
        nombre=payload.nombre,
        descripcion=payload.descripcion,
        precio=payload.precio,
        stock=payload.stock,
        vendedor_id=vendedor_pk,
        category_id=payload.category_id,
        external_id=payload.external_id,
        source=payload.source,
        imagen_url=payload.imagen_url,
        destacado=payload.destacado,
        
    )
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return ProductoRead.model_validate(obj, from_attributes=True)

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    session: Session = Depends(get_session),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    id_vendedor: Optional[int] = Query(None, description="id_vendedor (manual)"),
):
    stmt = select(Producto).offset(offset).limit(limit)
    if id_vendedor is not None:
        vendedor_pk = _resolver_vendedor_pk(session, id_vendedor)
        stmt = stmt.where(Producto.vendedor_id == vendedor_pk)
    rows = session.exec(stmt).all()
    return [ProductoRead.model_validate(r, from_attributes=True) for r in rows]

@router.get("/destacados", response_model=List[Producto])
def productos_destacados(session: Session = Depends(get_session)):
    stmt = select(Producto).where(Producto.destacado == True)
    return session.exec(stmt).all()

@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    obj = session.get(Producto, producto_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return ProductoRead.model_validate(obj, from_attributes=True)

@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(producto_id: int, payload: ProductoUpdate, session: Session = Depends(get_session)):
    obj = session.get(Producto, producto_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    data = payload.model_dump(exclude_unset=True)
    if "id_vendedor" in data and data["id_vendedor"] is not None:
        obj.vendedor_id = _resolver_vendedor_pk(session, data.pop("id_vendedor"))

    for k, v in data.items():
        setattr(obj, k, v)

    session.add(obj)
    session.commit()
    session.refresh(obj)
    return ProductoRead.model_validate(obj, from_attributes=True)

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, session: Session = Depends(get_session)):
    obj = session.get(Producto, producto_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    session.delete(obj)
    session.commit()
    return



