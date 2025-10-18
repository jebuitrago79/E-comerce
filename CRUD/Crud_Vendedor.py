# CRUD/Crud_Vendedor.py
from typing import List, Optional

from sqlmodel import Session, select
from Modelos.Vendedor import Vendedor
from Modelos.common import EstadoCuenta


def _coerce_estado(value: Optional[str]) -> Optional[EstadoCuenta]:
    if value is None:
        return None
    v = value.strip().lower()
    if v not in {e.value for e in EstadoCuenta}:
        raise ValueError("estado_cuenta debe ser 'activo' o 'bloqueado'")
    return EstadoCuenta(v)


def crear_vendedor(
    session: Session,
    *,
    nombre: str,
    email: str,
    password: str,
    estado_cuenta: str = "activo",
    id_vendedor: int,
    empresa: str,
    direccion: str,
    telefono: str,
) -> Vendedor:

    ya = session.exec(select(Vendedor).where(Vendedor.email == email)).first()
    if ya:
        raise ValueError(f"El email '{email}' ya existe en vendedores.")

    ya2 = session.exec(select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)).first()
    if ya2:
        raise ValueError(f"El id_vendedor '{id_vendedor}' ya existe.")

    estado_norm = _coerce_estado(estado_cuenta) or EstadoCuenta.activo

    vendedor = Vendedor(
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_norm,   # <- Enum válido
        id_vendedor=id_vendedor,
        empresa=empresa,
        direccion=direccion,
        telefono=telefono,
    )
    session.add(vendedor)
    session.commit()
    session.refresh(vendedor)
    return vendedor


def obtener_vendedor(session: Session, vendedor_id: int) -> Optional[Vendedor]:
    return session.get(Vendedor, vendedor_id)


def listar_vendedores(session: Session) -> List[Vendedor]:
    return session.exec(select(Vendedor)).all()


def actualizar_vendedor(session: Session, vendedor_id: int, **campos) -> Optional[Vendedor]:
    vendedor = session.get(Vendedor, vendedor_id)
    if not vendedor:
        return None

    nuevo_email = campos.get("email")
    if nuevo_email and nuevo_email != vendedor.email:
        existe = session.exec(select(Vendedor).where(Vendedor.email == nuevo_email)).first()
        if existe:
            raise ValueError(f"El email '{nuevo_email}' ya existe en vendedores.")

    nuevo_idv = campos.get("id_vendedor")
    if nuevo_idv and nuevo_idv != vendedor.id_vendedor:
        existe2 = session.exec(select(Vendedor).where(Vendedor.id_vendedor == nuevo_idv)).first()
        if existe2:
            raise ValueError(f"El id_vendedor '{nuevo_idv}' ya existe.")

    if "estado_cuenta" in campos and campos["estado_cuenta"] is not None:
        campos["estado_cuenta"] = _coerce_estado(campos["estado_cuenta"])

    for k, v in campos.items():
        if v is not None:
            setattr(vendedor, k, v)

    session.add(vendedor)
    session.commit()
    session.refresh(vendedor)
    return vendedor


def eliminar_vendedor(session: Session, vendedor_id: int) -> bool:
    vendedor = session.get(Vendedor, vendedor_id)
    if not vendedor:
        return False
    session.delete(vendedor)
    session.commit()
    return True
