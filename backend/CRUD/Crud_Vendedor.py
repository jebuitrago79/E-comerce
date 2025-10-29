# CRUD/Crud_Vendedor.py
from typing import List, Optional

from sqlmodel import Session, select
from backend.Modelos.Vendedor import Vendedor
from backend.Modelos.common import EstadoCuenta


from typing import Optional
from sqlmodel import Session, select
from backend.Modelos.Vendedor import Vendedor
from backend.Modelos.common import EstadoCuenta
# si usas un helper:
# from backend.Modelos.common import _coerce_estado  # o implementa tu normalizador

def _coerce_estado(valor: Optional[str]) -> EstadoCuenta:
    """
    Convierte str -> EstadoCuenta; por defecto 'activo' si viene None/"" o inválido.
    """
    if not valor:
        return EstadoCuenta.activo
    try:
        # acepta "activo"/"bloqueado" sin importar mayúsculas
        return EstadoCuenta(valor.lower())
    except Exception:
        return EstadoCuenta.activo

def crear_vendedor(
    session: Session,
    *,
    nombre: str,
    email: str,
    password: str,
    estado_cuenta: str = "activo",
    id_vendedor: Optional[int] = None,      # <- ahora opcional
    empresa: Optional[str] = None,          # <- opcional
    direccion: Optional[str] = None,        # <- opcional
    telefono: Optional[str] = None,         # <- opcional
) -> Vendedor:
    # Normalización básica
    nombre = nombre.strip()
    email = email.strip()
    password = password.strip()
    empresa = (empresa or "").strip() or None
    direccion = (direccion or "").strip() or None
    telefono = (telefono or "").strip() or None

    # 1) Email único
    ya = session.exec(select(Vendedor).where(Vendedor.email == email)).first()
    if ya:
        raise ValueError(f"El email '{email}' ya existe en vendedores.")

    # 2) id_vendedor único SOLO si viene
    if id_vendedor is not None:
        ya2 = session.exec(
            select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
        ).first()
        if ya2:
            raise ValueError(f"El id_vendedor '{id_vendedor}' ya existe.")

    # 3) Enum estado
    estado_norm = _coerce_estado(estado_cuenta)

    # 4) Crear
    vendedor = Vendedor(
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_norm,
        id_vendedor=id_vendedor,   # puede ser None
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
