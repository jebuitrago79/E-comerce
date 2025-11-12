# backend/CRUD/Crud_Comprador.py
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from backend.Modelos.Comprador import Comprador

def crear_comprador(session: Session, **data) -> Comprador:
    obj = Comprador(**data)
    try:
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    except IntegrityError as e:
        session.rollback()
        raise ValueError("Email o id_comprador duplicado") from e

def listar_compradores(session: Session) -> List[Comprador]:
    return session.exec(select(Comprador)).all()

def obtener_comprador(session: Session, comprador_id: int) -> Optional[Comprador]:
    return session.get(Comprador, comprador_id)

def actualizar_comprador(session: Session, comprador_id: int, **data) -> Optional[Comprador]:
    obj = session.get(Comprador, comprador_id)
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
        raise ValueError("Email o id_comprador duplicado") from e

def eliminar_comprador(session: Session, comprador_id: int) -> bool:
    obj = session.get(Comprador, comprador_id)
    if not obj:
        return False
    session.delete(obj)
    session.commit()
    return True
