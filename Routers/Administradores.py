from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import SQLModel, Session, select
from db.engine import get_session
from Modelos.Administrador import Administrador
from Modelos.Usuario import Usuario

router = APIRouter(prefix="/administradores", tags=["Administradores"])


# Crear administrador
@router.post("/", response_model=Administrador)
def crear_admin(admin: Administrador, session: Session = Depends(get_session)):
    existente = session.exec(
        select(Administrador).where(Administrador.email == admin.email)
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="El administrador ya existe")
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


# Listar todos los administradores
@router.get("/", response_model=list[Administrador])
def listar_admins(session: Session = Depends(get_session)):
    return session.exec(select(Administrador)).all()


# Listar todos los usuarios
@router.get("/usuarios", response_model=list[Usuario])
def listar_usuarios(session: Session = Depends(get_session)):
    return session.exec(select(Usuario)).all()


# Bloquear un usuario
@router.put("/usuarios/{usuario_id}/bloquear")
def bloquear_usuario(usuario_id: int, session: Session = Depends(get_session)):
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.estado_cuenta = "bloqueado"
    session.add(usuario)
    session.commit()
    return {"message": f"Usuario {usuario.nombre} bloqueado correctamente"}


# Eliminar un usuario
@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, session: Session = Depends(get_session)):
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    session.delete(usuario)
    session.commit()
    return {"message": f"Usuario {usuario.nombre} eliminado correctamente"}###
