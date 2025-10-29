# CRUD/Crud_Comprador.py
from typing import List, Optional

from sqlmodel import Session, select
from backend.Modelos.Comprador import Comprador
from backend.Modelos.common import EstadoCuenta


def _coerce_estado(value: Optional[str]) -> Optional[EstadoCuenta]:
    if value is None:
        return None
    v = value.strip().lower()
    if v not in {e.value for e in EstadoCuenta}:
        raise ValueError("estado_cuenta debe ser 'activo' o 'bloqueado'")
    return EstadoCuenta(v)


def crear_comprador(
    session: Session,
    *,
    nombre: str,
    email: str,
    password: str,
    estado_cuenta: str = "activo",
    id_comprador: int,
    direccion: str,
    telefono: str,
) -> Comprador:


    ya = session.exec(select(Comprador).where(Comprador.email == email)).first()
    if ya:
        raise ValueError(f"El email '{email}' ya existe en compradores.")

    ya2 = session.exec(select(Comprador).where(Comprador.id_comprador == id_comprador)).first()
    if ya2:
        raise ValueError(f"El id_comprador '{id_comprador}' ya existe.")

    estado_norm = _coerce_estado(estado_cuenta) or EstadoCuenta.activo

    comprador = Comprador(
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_norm,
        id_comprador=id_comprador,
        direccion=direccion,
        telefono=telefono,
    )
    session.add(comprador)
    session.commit()
    session.refresh(comprador)
    return comprador


def obtener_comprador(session: Session, comprador_id: int) -> Optional[Comprador]:
    return session.get(Comprador, comprador_id)


def listar_compradores(session: Session) -> List[Comprador]:
    return session.exec(select(Comprador)).all()


def actualizar_comprador(session: Session, comprador_id: int, **campos) -> Optional[Comprador]:
    comprador = session.get(Comprador, comprador_id)
    if not comprador:
        return None

    campos_prohibidos = {"id", "id_comprador", "email"}
    for campo in campos_prohibidos:
        if campo in campos:
            raise ValueError(f"No se permite modificar el campo '{campo}' porque es un identificador único.")

    if "estado_cuenta" in campos and campos["estado_cuenta"] is not None:
        campos["estado_cuenta"] = _coerce_estado(campos["estado_cuenta"])


    for k, v in campos.items():
        if v is not None:
            setattr(comprador, k, v)

    session.add(comprador)
    session.commit()
    session.refresh(comprador)
    return comprador


def eliminar_comprador(session: Session, comprador_id: int) -> bool:
    comprador = session.get(Comprador, comprador_id)
    if not comprador:
        return False
    session.delete(comprador)
    session.commit()
    return True
