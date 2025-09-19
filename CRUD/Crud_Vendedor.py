from typing import List, Optional
from sqlmodel import Session, select
from Modelos.Vendedor import Vendedor

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

    vendedor = Vendedor(
        nombre=nombre,
        email=email,
        password=password,
        estado_cuenta=estado_cuenta,
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