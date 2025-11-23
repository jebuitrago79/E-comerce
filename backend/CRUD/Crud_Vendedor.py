# backend/CRUD/Crud_Vendedor.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from backend.Modelos import Producto, Tienda
from backend.Modelos.Vendedor import Vendedor
from backend.Modelos.common import EstadoCuenta

# Campos que realmente existen en el modelo de BD
_ALLOWED_FIELDS = {"id_vendedor", "nombre", "email", "password", "estado_cuenta", "telefono"}


def _filter_allowed(data: Dict[str, Any]) -> Dict[str, Any]:
    """Filtra el diccionario para evitar keys que no existen en el modelo."""
    return {k: v for k, v in data.items() if k in _ALLOWED_FIELDS}


# ============ CREATE ============
def crear_vendedor(session: Session, **data) -> Vendedor:
    data = _filter_allowed(data)

    # Reglas de negocio mínimas
    if "id_vendedor" not in data:
        raise ValueError("id_vendedor es obligatorio")
    if "email" not in data:
        raise ValueError("email es obligatorio")
    if "password" not in data:
        raise ValueError("password es obligatorio")

    # Unicidad lógica previa (mensaje más claro que el de la BD)
    existente_id = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == data["id_vendedor"])
    ).first()
    if existente_id:
        raise ValueError("Ya existe un vendedor con ese id_vendedor")

    existente_email = session.exec(
        select(Vendedor).where(Vendedor.email == data["email"])
    ).first()
    if existente_email:
        raise ValueError("Ya existe un vendedor con ese email")

    obj = Vendedor(**data)
    try:
        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj
    except IntegrityError as e:
        session.rollback()
        # Si por condiciones de carrera se disparó la constraint de la BD:
        raise ValueError("Email o id_vendedor duplicado") from e


# ============ READ ============
def listar_vendedores(session: Session) -> List[Vendedor]:
    return session.exec(select(Vendedor)).all()


def obtener_vendedor(session: Session, id_vendedor: int) -> Optional[Vendedor]:
    """Busca por el ID MANUAL (id_vendedor), no por PK."""
    return session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()


# ============ UPDATE ============
def actualizar_vendedor(session: Session, id_vendedor: int, **data) -> Optional[Vendedor]:
    """
    Actualiza buscando por el ID MANUAL (id_vendedor).
    Permite cambiar email / telefono / nombre / password / estado_cuenta.
    Si intentas cambiar id_vendedor, valida que no choque con otro registro.
    """
    obj = obtener_vendedor(session, id_vendedor)
    if not obj:
        return None

    data = _filter_allowed(data)

    # Si cambia id_vendedor, validar colisión
    nuevo_id_v = data.get("id_vendedor")
    if nuevo_id_v is not None and nuevo_id_v != obj.id_vendedor:
        choque = session.exec(
            select(Vendedor).where(Vendedor.id_vendedor == nuevo_id_v)
        ).first()
        if choque:
            raise ValueError("Ya existe otro vendedor con ese id_vendedor")

    # Si cambia email, validar unicidad
    nuevo_email = data.get("email")
    if nuevo_email is not None and nuevo_email != obj.email:
        choque = session.exec(
            select(Vendedor).where(Vendedor.email == nuevo_email)
        ).first()
        if choque:
            raise ValueError("Ya existe otro vendedor con ese email")

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
        raise ValueError("Email o id_vendedor duplicado") from e


# ============ DELETE ============
def eliminar_vendedor(session: Session, id_vendedor: int) -> bool:
    # id_vendedor = ID MANUAL (ej. 80027655)
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()

    if not vendedor:
        return False

    # 👇 soft delete: sólo bloqueamos la cuenta, no borramos la fila
    vendedor.estado_cuenta = EstadoCuenta.bloqueado
    session.add(vendedor)
    session.commit()
    session.refresh(vendedor)
    return True

def productos_de_vendedor(session: Session, id_vendedor: int):
    """
    Devuelve todos los productos que pertenecen a un vendedor,
    recibiendo el ID MANUAL (id_vendedor).
    """
    vendedor = obtener_vendedor(session, id_vendedor)
    if not vendedor:
        return []

    stmt = select(Producto).where(Producto.vendedor_id == vendedor.id)  # FK usa PK
    return session.exec(stmt).all()


def tienda_de_vendedor(session: Session, id_vendedor: int):
    """
    Devuelve la tienda asociada a un vendedor (si existe),
    recibiendo el ID MANUAL (id_vendedor).
    """
    vendedor = obtener_vendedor(session, id_vendedor)
    if not vendedor:
        return None

    stmt = select(Tienda).where(Tienda.vendedor_id == vendedor.id)
    return session.exec(stmt).first()

