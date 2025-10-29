# Routers/vendedores.py
from typing import List, Optional
from backend.db.engine import get_session
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, SQLModel

from backend.db.engine import engine
def get_session():
    with Session(engine) as session:
        yield session

from backend.CRUD.Crud_Vendedor import (
    crear_vendedor, listar_vendedores, obtener_vendedor,
    actualizar_vendedor, eliminar_vendedor,
)
from backend.Modelos.common import EstadoCuenta
from backend.Modelos.Vendedor import Vendedor

router = APIRouter(prefix="/vendedores", tags=["Vendedores"])


class VendedorCreate(SQLModel):
    nombre: str
    email: str
    password: str
    estado_cuenta: EstadoCuenta = EstadoCuenta.activo  # <- Enum
    id_vendedor: int
    empresa: str
    direccion: str
    telefono: str


class VendedorUpdate(SQLModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    estado_cuenta: Optional[EstadoCuenta] = None  # <- Enum opcional
    id_vendedor: Optional[int] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None


class VendedorRead(SQLModel):
    id: int
    nombre: str
    email: str
    estado_cuenta: EstadoCuenta
    id_vendedor: int
    empresa: str
    direccion: str
    telefono: str


@router.post("/", response_model=Vendedor)
def crear_vendedor(data: VendedorCreate, session: Session = Depends(get_session)):
    vend = Vendedor(
        id=data.id_vendedor,
        nombre=data.nombre.strip(),
        email=data.email.strip(),
        telefono=data.telefono.strip(),
        password=data.password,
        empresa=data.empresa,
        direccion=data.direccion,
        estado_cuenta="activo",
    )
    try:
        session.add(vend)
        session.commit()
        session.refresh(vend)
        return vend
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear vendedor: {e}")


@router.get("/", response_model=List[VendedorRead])
def get_vendedores(
    session: Session = Depends(get_session),
    empresa: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    vendedores = listar_vendedores(session)
    if empresa:
        vendedores = [v for v in vendedores if (v.empresa or "").lower().find(empresa.lower()) >= 0]
    if email:
        vendedores = [v for v in vendedores if v.email.lower() == email.lower()]
    vendedores = vendedores[offset: offset + limit]
    return [VendedorRead.model_validate(v, from_attributes=True) for v in vendedores]


@router.get("/{vendedor_id}", response_model=VendedorRead)
def get_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    v = obtener_vendedor(session, vendedor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(v, from_attributes=True)


@router.put("/{vendedor_id}", response_model=VendedorRead)
def update_vendedor(vendedor_id: int, payload: VendedorUpdate, session: Session = Depends(get_session)):
    try:
        actualizado = actualizar_vendedor(session, vendedor_id, **payload.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not actualizado:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(actualizado, from_attributes=True)


@router.delete("/{vendedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    ok = eliminar_vendedor(session, vendedor_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return None
