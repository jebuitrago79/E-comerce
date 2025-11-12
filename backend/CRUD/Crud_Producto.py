# backend/CRUD/Crud_Producto.py
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from backend.Modelos.Producto import Producto

def crear_producto(session: Session, **data) -> Producto:
    obj = Producto(**data)
    try:
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    except IntegrityError as e:
        session.rollback()
        raise ValueError("Violación de FK o unicidad") from e

def listar_productos(session: Session, limit: int = 50, offset: int = 0) -> List[Producto]:
    return session.exec(select(Producto).offset(offset).limit(limit)).all()

def obtener_producto(session: Session, producto_id: int) -> Optional[Producto]:
    return session.get(Producto, producto_id)

def actualizar_producto(session: Session, producto_id: int, **data) -> Optional[Producto]:
    obj = session.get(Producto, producto_id)
    if not obj:
        return None
    try:
        for k, v in data.items():
            setattr(obj, k, v)
        obj.updated_at = datetime.utcnow()
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    except IntegrityError as e:
        session.rollback()
        raise ValueError("Violación de FK o unicidad") from e

def eliminar_producto(session: Session, producto_id: int) -> bool:
    obj = session.get(Producto, producto_id)
    if not obj:
        return False
    session.delete(obj)
    session.commit()
    return True
