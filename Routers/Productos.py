from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from db.engine import get_session
from Modelos.Producto import Producto
from typing import Optional, List
from enum import Enum

router = APIRouter(prefix="/productos", tags=["Productos"])

# Lista de categorías disponibles
class CategoriaEnum(str, Enum):
    ropa = "ropa"
    tecnologia = "tecnologia"
    comida = "comida"
    deportes = "deportes"

# ---------------------------
# Crear producto
# ---------------------------
@router.post("/", response_model=Producto)
def crear_producto(producto: Producto, session: Session = Depends(get_session)):
    try:
        session.add(producto)
        session.commit()
        session.refresh(producto)
        return producto
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear producto: {e}")


# ---------------------------
# Listar productos con filtros (aparece correctamente en Swagger)
# ---------------------------
@router.get("/filtros", response_model=List[Producto])
def listar_productos(
    categoria: Optional[CategoriaEnum] = Query(None, description="Filtrar por categoría"),
    nombre: Optional[str] = Query(None, description="Buscar por nombre"),
    precio_min: Optional[float] = Query(None, description="Filtrar por precio mínimo"),
    precio_max: Optional[float] = Query(None, description="Filtrar por precio máximo"),
    session: Session = Depends(get_session),
):
    query = select(Producto)

    if categoria:
        query = query.where(Producto.categoria == categoria.value)
    if nombre:
        query = query.where(Producto.nombre.ilike(f"%{nombre}%"))
    if precio_min is not None:
        query = query.where(Producto.precio >= precio_min)
    if precio_max is not None:
        query = query.where(Producto.precio <= precio_max)

    productos = session.exec(query).all()
    return productos


# ---------------------------
# Obtener producto por ID
# ---------------------------
@router.get("/{producto_id}", response_model=Producto)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


# ---------------------------
# Actualizar producto
# ---------------------------
@router.put("/{producto_id}", response_model=Producto)
def actualizar_producto(producto_id: int, datos: dict, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    for clave, valor in datos.items():
        setattr(producto, clave, valor)

    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


# ---------------------------
# Eliminar producto
# ---------------------------
@router.delete("/{producto_id}")
def eliminar_producto(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    session.delete(producto)
    session.commit()
    return {"mensaje": "Producto eliminado correctamente"}
