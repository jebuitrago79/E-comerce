# backend/CRUD/Crud_Vendedor.py
from typing import List, Optional
from sqlmodel import Session, select
from backend.Modelos.Vendedor import Vendedor


def listar_vendedores(session: Session, *, limit: int = 50, offset: int = 0) -> List[Vendedor]:
    stmt = select(Vendedor).offset(offset).limit(limit)
    return list(session.exec(stmt).all())


def obtener_vendedor(session: Session, id_vendedor: int) -> Optional[Vendedor]:
    stmt = select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    return session.exec(stmt).first()


def crear_vendedor(
    session: Session,
    *,
    id_vendedor: int,
    nombre: str,
    email: str,
    password: str,
    estado_cuenta: str = "activo",
    empresa: str | None = None,
    direccion: str | None = None,
    telefono: str | None = None,
) -> Vendedor:

    # Validaciones de unicidad
    ya_email = session.exec(select(Vendedor).where(Vendedor.email == email)).first()
    if ya_email:
        raise ValueError(f"El email '{email}' ya existe en vendedores.")

    ya_id = session.exec(select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)).first()
    if ya_id:
        raise ValueError(f"El id_vendedor '{id_vendedor}' ya existe.")

    v = Vendedor(
        id_vendedor=id_vendedor,
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_cuenta,
        empresa=empresa,
        direccion=direccion,
        telefono=telefono,
    )
    session.add(v)
    session.commit()
    session.refresh(v)
    return v


def actualizar_vendedor(
    session: Session,
    id_vendedor: int,
    *,
    nombre: str | None = None,
    email: str | None = None,
    password: str | None = None,
    estado_cuenta: str | None = None,
    empresa: str | None = None,
    direccion: str | None = None,
    telefono: str | None = None,
) -> Vendedor:
    v = obtener_vendedor(session, id_vendedor)
    if not v:
        raise LookupError("Vendedor no encontrado.")

    # si cambia el email, verificar unicidad
    if email and email != v.email:
        ya_email = session.exec(select(Vendedor).where(Vendedor.email == email)).first()
        if ya_email:
            raise ValueError(f"El email '{email}' ya existe en vendedores.")

    if nombre is not None:
        v.nombre = nombre
    if email is not None:
        v.email = email
    if password is not None:
        v.password = password
    if estado_cuenta is not None:
        v.estado_cuenta = estado_cuenta
    if empresa is not None:
        v.empresa = empresa
    if direccion is not None:
        v.direccion = direccion
    if telefono is not None:
        v.telefono = telefono

    session.add(v)
    session.commit()
    session.refresh(v)
    return v


def eliminar_vendedor(session: Session, id_vendedor: int) -> None:
    v = obtener_vendedor(session, id_vendedor)
    if not v:
        raise LookupError("Vendedor no encontrado.")
    session.delete(v)
    session.commit()


