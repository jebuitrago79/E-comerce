from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, SQLModel

from db.engine import engine
from CRUD.Crud_Vendedor import (
    crear_vendedor,
    listar_vendedores,
    obtener_vendedor,
    actualizar_vendedor,
    eliminar_vendedor,
)

def get_session():
    with Session(engine) as session:
        yield session

router = APIRouter(prefix="/vendedores", tags=["Vendedores"])

class VendedorCreate(SQLModel):
    nombre: str
    email: str
    password: str
    estado_cuenta: str = "activo"   # "activo" | "bloqueado"
    id_vendedor: int
    empresa: str
    direccion: str
    telefono: str

class VendedorUpdate(SQLModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    estado_cuenta: Optional[str] = None
    id_vendedor: Optional[int] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None

class VendedorRead(SQLModel):
    id: int
    nombre: str
    email: str
    estado_cuenta: str
    id_vendedor: int
    empresa: str
    direccion: str
    telefono: str


@router.post("/", response_model=VendedorRead, status_code=status.HTTP_201_CREATED)
def create_vendedor(payload: VendedorCreate, session: Session = Depends(get_session)):
    try:
        nuevo = crear_vendedor(
            session,
            nombre=payload.nombre,
            email=payload.email,
            password=payload.password,
            estado_cuenta=payload.estado_cuenta,
            id_vendedor=payload.id_vendedor,
            empresa=payload.empresa,
            direccion=payload.direccion,
            telefono=payload.telefono,
        )

        return VendedorRead.model_validate(nuevo.__dict__)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[VendedorRead])
def get_vendedores(
    session: Session = Depends(get_session),
    empresa: Optional[str] = Query(None, description="Filtrar por nombre de empresa (contiene)"),
    email: Optional[str] = Query(None, description="Filtrar por email exacto"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    vendedores = listar_vendedores(session)
    if empresa:
        vendedores = [v for v in vendedores if (v.empresa or "").lower().find(empresa.lower()) >= 0]
    if email:
        vendedores = [v for v in vendedores if v.email.lower() == email.lower()]
    vendedores = vendedores[offset: offset + limit]
    return [VendedorRead.model_validate(v.__dict__) for v in vendedores]

@router.get("/{vendedor_id}", response_model=VendedorRead)
def get_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    v = obtener_vendedor(session, vendedor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(v.__dict__)

@router.get("/by-idv/{id_vendedor}", response_model=VendedorRead)
def get_vendedor_by_idv(id_vendedor: int, session: Session = Depends(get_session)):
    # Si quieres hacerlo en DB, crea un crud específico; aquí lo resolvemos rápido:
    for v in listar_vendedores(session):
        if v.id_vendedor == id_vendedor:
            return VendedorRead.model_validate(v.__dict__)
    raise HTTPException(status_code=404, detail="Vendedor no encontrado por id_vendedor")

@router.put("/{vendedor_id}", response_model=VendedorRead)
def update_vendedor(vendedor_id: int, payload: VendedorUpdate, session: Session = Depends(get_session)):
    try:
        actualizado = actualizar_vendedor(
            session,
            vendedor_id,
            **payload.model_dump(exclude_unset=True),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not actualizado:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return VendedorRead.model_validate(actualizado.__dict__)

@router.delete("/{vendedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendedor(vendedor_id: int, session: Session = Depends(get_session)):
    ok = eliminar_vendedor(session, vendedor_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")
    return None
