from typing import List, Optional
from sqlmodel import Session, select
from Modelos.User import Usuario
from Modelos.Vendedor import Vendedor

from sqlmodel import SQLModel
print("DEBUG Vendedor:", Vendedor, "module=", Vendedor.__module__)
print("DEBUG has mapper?", hasattr(Vendedor, "__mapper__"))
print("DEBUG tables:", list(SQLModel.metadata.tables.keys()))

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

    ya = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if ya:
        raise ValueError(f"El email '{email}' ya existe.")

    vendedor = Vendedor(
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_cuenta,
        tipo="vendedor",
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

    campos.pop("tipo", None)

    nuevo_email = campos.get("email")
    if nuevo_email and nuevo_email != vendedor.email:
        existe = session.exec(select(Usuario).where(Usuario.email == nuevo_email)).first()
        if existe:
            raise ValueError(f"El email '{nuevo_email}' ya existe.")

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