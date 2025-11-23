# backend/Routers/Administradores.py

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, Session, select
from backend.db.engine import get_session
from backend.Modelos.Administrador import Administrador
from backend.Modelos.common import EstadoCuenta

router = APIRouter(prefix="/administradores", tags=["Administradores"])


# --------- DTOs ---------

class AdministradorUpdate(SQLModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    nivel_acceso: Optional[str] = None   # ajustado a str para ser consistente
    estado_cuenta: Optional[EstadoCuenta] = None


class EstadoPayload(SQLModel):
    estado_cuenta: EstadoCuenta


class AdminCreate(SQLModel):
    id_admin: int
    nombre: str
    email: str
    password: str
    nivel_acceso: str


class AdminLogin(SQLModel):
    email: str
    password: str


# --------- CRUD ADMINISTRADORES ---------

@router.post("/", response_model=Administrador)
def crear_admin(
    data: AdminCreate,
    session: Session = Depends(get_session),
):
    # Validar email único
    existe = session.exec(
        select(Administrador).where(Administrador.email == data.email)
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="El email ya está en uso")

    admin = Administrador(
        id_admin=data.id_admin,
        nombre=data.nombre,
        email=data.email,
        password=data.password,
        nivel_acceso=data.nivel_acceso,
        estado_cuenta=EstadoCuenta.activo,
    )

    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@router.get("/", response_model=List[Administrador])
def listar_administradores(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(Administrador).offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.put("/{id_admin}", response_model=Administrador)
def actualizar_admin(
    id_admin: int,
    data: AdministradorUpdate,
    session: Session = Depends(get_session),
):
    admin = session.exec(
        select(Administrador).where(Administrador.id_admin == id_admin)
    ).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    # Si cambia el email, valida unicidad
    if data.email and data.email != admin.email:
        existe = session.exec(
            select(Administrador).where(Administrador.email == data.email)
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail="Email ya está en uso")

    # Actualiza sólo lo enviado
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(admin, campo, valor)

    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@router.patch("/{id_admin}/estado", response_model=Administrador)
def cambiar_estado_admin(
    id_admin: int,
    payload: EstadoPayload,
    session: Session = Depends(get_session),
):
    admin = session.exec(
        select(Administrador).where(Administrador.id_admin == id_admin)
    ).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    admin.estado_cuenta = payload.estado_cuenta
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@router.delete("/{id_admin}")
def desactivar_admin(
    id_admin: int,
    session: Session = Depends(get_session),
):
    admin = session.exec(
        select(Administrador).where(Administrador.id_admin == id_admin)
    ).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    admin.estado_cuenta = EstadoCuenta.bloqueado
    session.add(admin)
    session.commit()
    return {"message": f"Administrador {admin.nombre} desactivado"}


# --------- LOGIN ADMIN ---------

@router.post("/login", response_model=Administrador)
def login_admin(
    credenciales: AdminLogin,
    session: Session = Depends(get_session),
):
    admin = session.exec(
        select(Administrador).where(Administrador.email == credenciales.email)
    ).first()

    if not admin or admin.password != credenciales.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if admin.estado_cuenta != EstadoCuenta.activo:
        raise HTTPException(status_code=403, detail="Cuenta no activa")

    return admin
