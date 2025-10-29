# Routers/compradores.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import SQLModel ,Session, SQLModel
from backend.db.engine import get_session
from backend.db.engine import engine


def get_session():
    with Session(engine) as session:
        yield session


from backend.CRUD.Crud_Comprador import (
    crear_comprador, listar_compradores, obtener_comprador,
    actualizar_comprador, eliminar_comprador,
)
from backend.Modelos.common import EstadoCuenta


router = APIRouter(prefix="/compradores", tags=["Compradores"])


# ----- SCHEMAS ----- #

class CompradorCreate(SQLModel):
    nombre: str
    email: str
    password: str
    estado_cuenta: EstadoCuenta = EstadoCuenta.activo
    id_comprador: int
    direccion: str
    telefono: str


class CompradorUpdate(SQLModel):
    nombre: Optional[str] = None
    password: Optional[str] = None
    estado_cuenta: Optional[EstadoCuenta] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None


class CompradorRead(SQLModel):
    id: int
    nombre: str
    email: str
    estado_cuenta: EstadoCuenta
    id_comprador: int
    direccion: str
    telefono: str


# ----- ENDPOINTS ----- #

@router.post("/", response_model=CompradorRead, status_code=status.HTTP_201_CREATED)
def create_comprador(payload: CompradorCreate, session: Session = Depends(get_session)):
    try:
        nuevo = crear_comprador(session, **payload.model_dump())
        return CompradorRead.model_validate(nuevo, from_attributes=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[CompradorRead])
def get_compradores(
    session: Session = Depends(get_session),
    direccion: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    compradores = listar_compradores(session)
    if direccion:
        compradores = [c for c in compradores if (c.direccion or "").lower().find(direccion.lower()) >= 0]
    if email:
        compradores = [c for c in compradores if c.email.lower() == email.lower()]
    compradores = compradores[offset: offset + limit]
    return [CompradorRead.model_validate(c, from_attributes=True) for c in compradores]


@router.get("/{comprador_id}", response_model=CompradorRead)
def get_comprador(comprador_id: int, session: Session = Depends(get_session)):
    c = obtener_comprador(session, comprador_id)
    if not c:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return CompradorRead.model_validate(c, from_attributes=True)


@router.put("/{comprador_id}", response_model=CompradorRead)
def update_comprador(comprador_id: int, payload: CompradorUpdate, session: Session = Depends(get_session)):
    try:
        actualizado = actualizar_comprador(session, comprador_id, **payload.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not actualizado:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return CompradorRead.model_validate(actualizado, from_attributes=True)


@router.delete("/{comprador_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comprador(comprador_id: int, session: Session = Depends(get_session)):
    ok = eliminar_comprador(session, comprador_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
    return None
