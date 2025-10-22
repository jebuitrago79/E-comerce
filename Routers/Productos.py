# Routers/productos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from sqlmodel import Session, select
from db.engine import get_session
from Modelos.Producto import Producto
from Modelos.Categoria import Categoria
from sqlmodel import SQLModel, Field


router = APIRouter(prefix="/tenants/{tenant_id}/productos", tags=["Productos"])

# =========================
# DTOs (requests/responses)
# =========================

class ProductoBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    vendedor_id: Optional[int] = None

class ProductoRead(ProductoBase):
    id: int
    tenant_id: int


# =========================
# Helpers/Validaciones
# =========================

def _validar_categoria(db: Session, tenant_id: int, category_id: Optional[int]) -> None:
    """Valida que la categoría exista y pertenezca al tenant (si fue enviada)."""
    if category_id is None:
        return
    cat = db.get(Categoria, category_id)
    if not cat or cat.tenant_id != tenant_id:
        raise HTTPException(status_code=400, detail="Categoría inválida para este tenant.")


# =========================
# Crear producto
# =========================

@router.post("/", response_model=ProductoRead)
def crear_producto(
    tenant_id: int,
    data: ProductoCreate,
    db: Session = Depends(get_session)
):
    _validar_categoria(db, tenant_id, data.category_id)

    prod = Producto(
        tenant_id=tenant_id,
        nombre=data.nombre,
        descripcion=data.descripcion,
        precio=data.precio,
        stock=data.stock,
        category_id=data.category_id,
        vendedor_id=data.vendedor_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    try:
        db.add(prod)
        db.commit()
        db.refresh(prod)
        return prod
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {e}")


# =========================
# Listar productos con filtros y paginación
# =========================

@router.get("/", response_model=List[ProductoRead])
def listar_productos(
    tenant_id: int,
    nombre: Optional[str] = Query(None, description="Buscar por nombre (ILIKE)"),
    precio_min: Optional[float] = Query(None, description="Filtrar por precio mínimo"),
    precio_max: Optional[float] = Query(None, description="Filtrar por precio máximo"),
    category_id: Optional[int] = Query(None, description="Filtrar por categoría id"),
    limit: int = Query(50, ge=1, le=200, description="Cantidad de resultados"),
    offset: int = Query(0, ge=0, description="Desplazamiento"),
    db: Session = Depends(get_session),
):
    stmt = select(Producto).where(Producto.tenant_id == tenant_id)

    if nombre:
        stmt = stmt.where(Producto.nombre.ilike(f"%{nombre}%"))
    if precio_min is not None:
        stmt = stmt.where(Producto.precio >= precio_min)
    if precio_max is not None:
        stmt = stmt.where(Producto.precio <= precio_max)
    if category_id is not None:
        # validar categoría del mismo tenant (si quieres evitar consultas inconsistentes)
        _validar_categoria(db, tenant_id, category_id)
        stmt = stmt.where(Producto.category_id == category_id)

    stmt = stmt.offset(offset).limit(limit)
    productos = db.exec(stmt).all()
    return productos


# =========================
# Obtener producto por ID
# =========================

@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    tenant_id: int,
    producto_id: int,
    db: Session = Depends(get_session)
):
    prod = db.get(Producto, producto_id)
    if not prod or prod.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod


# =========================
# Actualizar producto
# =========================

@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    tenant_id: int,
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_session)
):
    prod = db.get(Producto, producto_id)
    if not prod or prod.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # valida categoría si viene
    if data.category_id is not None:
        _validar_categoria(db, tenant_id, data.category_id)

    # aplica cambios
    if data.nombre is not None:
        prod.nombre = data.nombre
    if data.descripcion is not None:
        prod.descripcion = data.descripcion
    if data.precio is not None:
        prod.precio = data.precio
    if data.stock is not None:
        prod.stock = data.stock
    if data.category_id is not None:
        prod.category_id = data.category_id
    if data.vendedor_id is not None:
        prod.vendedor_id = data.vendedor_id

    prod.updated_at = datetime.utcnow()

    try:
        db.add(prod)
        db.commit()
        db.refresh(prod)
        return prod
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar producto: {e}")


# =========================
# Eliminar producto
# =========================

@router.delete("/{producto_id}")
def eliminar_producto(
    tenant_id: int,
    producto_id: int,
    db: Session = Depends(get_session)
):
    prod = db.get(Producto, producto_id)
    if not prod or prod.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    try:
        db.delete(prod)
        db.commit()
        return {"mensaje": "Producto eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar producto: {e}")


# =========================
# (Opcional) Endpoint by-slug si agregas slug en Producto
# =========================
# @router.get("/by-slug/{slug}", response_model=ProductoRead)
# def obtener_por_slug(tenant_id: int, slug: str, db: Session = Depends(get_session)):
#     stmt = select(Producto).where(Producto.tenant_id == tenant_id, Producto.slug == slug)
#     prod = db.exec(stmt).first()
#     if not prod:
#         raise HTTPException(status_code=404, detail="Producto no encontrado")
#     return prod


