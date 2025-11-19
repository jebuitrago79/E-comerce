# backend/Routers/Administradores.py
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, Session, select
from backend.db.engine import get_session
from backend.Modelos.Administrador import Administrador
from backend.Modelos.common import EstadoCuenta

router = APIRouter(prefix="/administradores", tags=["Administradores"])


# --- DTOs de actualización ---
class AdministradorUpdate(SQLModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    nivel_acceso: Optional[int] = None
    estado_cuenta: Optional[EstadoCuenta] = None


class EstadoPayload(SQLModel):
    estado_cuenta: EstadoCuenta


# ✅ GET LIST
@router.get("/", response_model=List[Administrador])
def listar_administradores(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(Administrador).offset(offset).limit(limit)
    return session.exec(stmt).all()


# --- PUT: modificar campos del admin ---
@router.put("/{id_admin}", response_model=Administrador)
def actualizar_admin(id_admin: int, data: AdministradorUpdate, session: Session = Depends(get_session)):
    admin = session.exec(select(Administrador).where(Administrador.id_admin == id_admin)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    # Si cambia el email, valida unicidad
    if data.email and data.email != admin.email:
        existe = session.exec(select(Administrador).where(Administrador.email == data.email)).first()
        if existe:
            raise HTTPException(status_code=400, detail="Email ya está en uso")

    # Actualiza sólo lo enviado (no sobrescribas con None)
    for campo, valor in data.dict(exclude_unset=True).items():
        setattr(admin, campo, valor)

    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


# --- PATCH: activar/desactivar (soft-delete) ---
@router.patch("/{id_admin}/estado", response_model=Administrador)
def cambiar_estado_admin(id_admin: int, payload: EstadoPayload, session: Session = Depends(get_session)):
    admin = session.exec(select(Administrador).where(Administrador.id_admin == id_admin)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")

    admin.estado_cuenta = payload.estado_cuenta
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


# DELETE lógico usando bloqueado
@router.delete("/{id_admin}")
def desactivar_admin(id_admin: int, session: Session = Depends(get_session)):
    admin = session.exec(select(Administrador).where(Administrador.id_admin == id_admin)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrador no encontrado")
    admin.estado_cuenta = EstadoCuenta.bloqueado
    session.add(admin)
    session.commit()
    return {"message": f"Administrador {admin.nombre} desactivado"}
