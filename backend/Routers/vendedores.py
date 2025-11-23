# backend/Routers/vendedores.py
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, SQLModel, Field, select
from backend.db.engine import get_session
from backend.Modelos.Vendedor import Vendedor
from backend.CRUD.Crud_Vendedor import (
    listar_vendedores,
    obtener_vendedor,
    crear_vendedor as crud_crear_vendedor,
    actualizar_vendedor as crud_actualizar_vendedor,
    eliminar_vendedor as crud_eliminar_vendedor,
    productos_de_vendedor,
    tienda_de_vendedor,
)
from backend.Modelos.common import EstadoCuenta
from pydantic import EmailStr, constr
from backend.Modelos.Producto import Producto


router = APIRouter(prefix="/vendedores", tags=["Vendedores"])

# ========= Schemas (DTOs) =========
class VendedorBase(SQLModel):
    nombre: constr(
        min_length=3,
        max_length=80,
        pattern=r"^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s\.\-]+$"
    )
    email: EmailStr
    telefono: Optional[constr(
        min_length=7,
        max_length=20,
        pattern=r"^[0-9+\-\s]+$"
    )] = None
    estado_cuenta: EstadoCuenta = EstadoCuenta.activo


class VendedorCreate(VendedorBase):
    id_vendedor: int = Field(
        gt=0,
        description="ID manual visible del vendedor"
    )
    password: constr(min_length=8)


class VendedorUpdate(SQLModel):
    nombre: Optional[constr(
        min_length=3,
        max_length=80,
        pattern=r"^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s\.\-]+$"
    )] = None
    email: Optional[EmailStr] = None
    telefono: Optional[constr(
        min_length=7,
        max_length=20,
        pattern=r"^[0-9+\-\s]+$"
    )] = None
    estado_cuenta: Optional[EstadoCuenta] = None
    password: Optional[constr(min_length=8)] = None


class VendedorRead(VendedorBase):
    id: int
    id_vendedor: int

class VendedorLogin(SQLModel):
    email: EmailStr
    password: constr(min_length=8)

class EstadoVendedorPayload(SQLModel):
    estado_cuenta: EstadoCuenta

# ========= Endpoints =========
@router.get("/", response_model=List[VendedorRead])
def get_vendedores(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
):
    vendedores = listar_vendedores(session)
    vendedores = vendedores[offset: offset + limit]
    return [VendedorRead.model_validate(v, from_attributes=True) for v in vendedores]


@router.get("/{id_vendedor}", response_model=VendedorRead)
def get_vendedor(id_vendedor: int, session: Session = Depends(get_session)):
    v = obtener_vendedor(session, id_vendedor)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(v, from_attributes=True)


@router.post("/", response_model=VendedorRead, status_code=status.HTTP_201_CREATED)
def create_vendedor(data: VendedorCreate, session: Session = Depends(get_session)):
    try:
        data_dict = data.model_dump(exclude_unset=True)
        v = crud_crear_vendedor(session, **data_dict)
        return VendedorRead.model_validate(v, from_attributes=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id_vendedor}", response_model=VendedorRead)
def update_vendedor(
    id_vendedor: int,
    data: VendedorUpdate,
    session: Session = Depends(get_session),
):
    try:
        v = crud_actualizar_vendedor(session, id_vendedor, **data.model_dump(exclude_unset=True))
        if not v:
            raise HTTPException(status_code=404, detail="Vendedor no encontrado")
        return VendedorRead.model_validate(v, from_attributes=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id_vendedor}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendedor(id_vendedor: int, session: Session = Depends(get_session)):
    ok = crud_eliminar_vendedor(session, id_vendedor)
    if not ok:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return

@router.get("/{id_vendedor}/tienda")
def get_tienda_vendedor(
    id_vendedor: int,
    session: Session = Depends(get_session),
):
    tienda = tienda_de_vendedor(session, id_vendedor)
    if not tienda:
        raise HTTPException(status_code=404, detail="El vendedor no tiene tienda.")
    return tienda


@router.get("/{id_vendedor}/productos", response_model=List[Producto])
def get_productos_vendedor(
    id_vendedor: int,
    session: Session = Depends(get_session),
):
    """
    Devuelve los productos del vendedor identificado por su ID MANUAL (id_vendedor),
    que es el que guardas en localStorage y usas en el frontend.
    """

    # 1) Buscar al vendedor por su ID MANUAL (campo Vendedor.id_vendedor)
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()

    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    # 2) Buscar productos cuyo FK vendedor_id = PK del vendedor
    stmt = select(Producto).where(Producto.vendedor_id == vendedor.id)
    productos = session.exec(stmt).all()

    return productos




@router.post("/login", response_model=VendedorRead)
    
def login_vendedor(
    credenciales: VendedorLogin,
    session: Session = Depends(get_session),
    ):
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.email == credenciales.email)
    ).first()

    if not vendedor:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if vendedor.password != credenciales.password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if vendedor.estado_cuenta != EstadoCuenta.activo:
        raise HTTPException(status_code=403, detail="Cuenta no activa")

    return VendedorRead.model_validate(vendedor, from_attributes=True)


@router.put("/{id_vendedor}/estado", response_model=Vendedor)   
def cambiar_estado_vendedor(
    id_vendedor: int,
    payload: EstadoVendedorPayload,
    session: Session = Depends(get_session),
):
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()

    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    vendedor.estado_cuenta = payload.estado_cuenta
    session.add(vendedor)
    session.commit()
    session.refresh(vendedor)
    return vendedor