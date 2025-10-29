# backend/Routers/vendedores.py
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, SQLModel, Field
from backend.db.engine import get_session
from backend.Modelos.Vendedor import Vendedor
from backend.CRUD.Crud_Vendedor import (
    listar_vendedores,
    obtener_vendedor,
    crear_vendedor as crud_crear_vendedor,
    actualizar_vendedor as crud_actualizar_vendedor,
    eliminar_vendedor as crud_eliminar_vendedor,
)

router = APIRouter(prefix="/vendedores", tags=["vendedores"])


# ========= Schemas =========
class VendedorBase(SQLModel):
    nombre: str
    email: str
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    estado_cuenta: str = "activo"


class VendedorCreate(VendedorBase):
    id_vendedor: int = Field(description="ID manual del vendedor (obligatorio)")
    password: str


class VendedorUpdate(SQLModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    estado_cuenta: Optional[str] = None
    password: Optional[str] = None


class VendedorRead(VendedorBase):
    id_vendedor: int


# ========= Endpoints =========
@router.get("/", response_model=List[VendedorRead])
def get_vendedores(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
):
    vendedores = listar_vendedores(session, limit=limit, offset=offset)
    return [VendedorRead.model_validate(v, from_attributes=True) for v in vendedores]


@router.get("/{id_vendedor}", response_model=VendedorRead)
def get_vendedor(id_vendedor: int, session: Session = Depends(get_session)):
    v = obtener_vendedor(session, id_vendedor)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(v, from_attributes=True)


@router.post("/", response_model=VendedorRead, status_code=201)
def create_vendedor(data: VendedorCreate, session: Session = Depends(get_session)):
    try:
        v = crud_crear_vendedor(session, **data.model_dump())
        return VendedorRead.model_validate(v, from_attributes=True)
    except ValueError as e:
        # unicidad email / id_vendedor
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id_vendedor}", response_model=VendedorRead)
def update_vendedor(
    id_vendedor: int,
    data: VendedorUpdate,
    session: Session = Depends(get_session),
):
    try:
        v = crud_actualizar_vendedor(session, id_vendedor, **data.model_dump(exclude_unset=True))
        return VendedorRead.model_validate(v, from_attributes=True)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id_vendedor}", status_code=204)
def delete_vendedor(id_vendedor: int, session: Session = Depends(get_session)):
    try:
        crud_eliminar_vendedor(session, id_vendedor)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

