from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel, Field
from backend.db.engine import get_session
from backend.Modelos.common import EstadoCuenta
from backend.CRUD.Crud_Vendedor import (
    crear_vendedor as crud_crear_vendedor,
    listar_vendedores as crud_listar_vendedores,
    obtener_vendedor as crud_obtener_vendedor,
    actualizar_vendedor as crud_actualizar_vendedor,
    eliminar_vendedor as crud_eliminar_vendedor,
)


class VendedorBase(SQLModel):
    nombre: str
    email: str
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    estado_cuenta: EstadoCuenta = EstadoCuenta.activo

class VendedorCreate(VendedorBase):
    password: str
    id_vendedor: Optional[int] = None  # <- opcional

class VendedorRead(VendedorBase):
    id: int
    id_vendedor: Optional[int] = None  # <- opcional


router = APIRouter(prefix="/vendedores", tags=["Vendedores"])

@router.get("/", response_model=List[VendedorRead])
def get_vendedores(
    limit: int = 50, offset: int = 0, session: Session = Depends(get_session)
):
    vendedores = crud_listar_vendedores(session, limit=limit, offset=offset)
    # FastAPI + SQLModel convierten automáticamente desde el ORM
    return vendedores

@router.post("/", response_model=VendedorRead, status_code=201)
def create_vendedor(payload: VendedorCreate, session: Session = Depends(get_session)):
    v = crud_crear_vendedor(session, payload)
    return v

@router.get("/{vendedor_id}", response_model=VendedorRead)
def get_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    v = crud_obtener_vendedor(session, vendedor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return v

@router.put("/{vendedor_id}", response_model=VendedorRead)
def update_vendedor(
    vendedor_id: int, payload: VendedorCreate, session: Session = Depends(get_session)
):
    v = crud_actualizar_vendedor(session, vendedor_id, payload)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return v

@router.delete("/{vendedor_id}", status_code=204)
def delete_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    ok = crud_eliminar_vendedor(session, vendedor_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
