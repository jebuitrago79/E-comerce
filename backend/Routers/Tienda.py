# backend/Routers/Tienda.py
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Session, select

from backend.db.engine import get_session
from backend.Modelos.Tienda import Tienda
from backend.Modelos.Vendedor import Vendedor

router = APIRouter(prefix="/tiendas", tags=["Tiendas"])


# ──────────────────────────────────────────────────────────────────────────────
# DTOs (schemas para entrada de datos)
# ──────────────────────────────────────────────────────────────────────────────

class TiendaCreate(SQLModel):
    id_vendedor: int  # ID MANUAL del vendedor
    nombre_negocio: str
    descripcion: Optional[str] = None
    color_primario: Optional[str] = None
    logo_url: Optional[str] = None
    slug: str


class TiendaUpdate(SQLModel):
    nombre_negocio: Optional[str] = None
    descripcion: Optional[str] = None
    color_primario: Optional[str] = None
    logo_url: Optional[str] = None
    slug: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────────────
# LISTAR TIENDAS (para admin, pruebas, etc.)
# GET /tiendas
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[Tienda])
def listar_tiendas(
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(Tienda).offset(offset).limit(limit)
    return session.exec(stmt).all()


# ──────────────────────────────────────────────────────────────────────────────
# CREAR TIENDA
# POST /tiendas
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/", response_model=Tienda, status_code=201)
def crear_tienda(
    payload: TiendaCreate,
    session: Session = Depends(get_session),
):
    # 1) Resolver vendedor por ID MANUAL
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == payload.id_vendedor)
    ).first()
    if not vendedor:
        raise HTTPException(
            status_code=400,
            detail="No existe un vendedor con ese id_vendedor.",
        )

    # 2) Validar que el vendedor (PK) no tenga ya una tienda
    stmt_vendedor = select(Tienda).where(Tienda.vendedor_id == vendedor.id)
    tienda_existente = session.exec(stmt_vendedor).first()
    if tienda_existente:
        raise HTTPException(
            status_code=400,
            detail="El vendedor ya tiene una tienda creada.",
        )

    # 3) Validar que el slug no esté repetido
    stmt_slug = select(Tienda).where(Tienda.slug == payload.slug)
    slug_existente = session.exec(stmt_slug).first()
    if slug_existente:
        raise HTTPException(
            status_code=400,
            detail="El slug ya está en uso, elija otro.",
        )

    nueva_tienda = Tienda(
        vendedor_id=vendedor.id,  # FK usa el PK del vendedor
        nombre_negocio=payload.nombre_negocio,
        descripcion=payload.descripcion,
        color_primario=payload.color_primario,
        logo_url=payload.logo_url,
        slug=payload.slug,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(nueva_tienda)
    session.commit()
    session.refresh(nueva_tienda)
    return nueva_tienda


# ──────────────────────────────────────────────────────────────────────────────
# OBTENER TIENDA POR SLUG (PÚBLICO)
# GET /tiendas/{slug}
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/{slug}", response_model=Tienda)
def obtener_tienda_por_slug(
    slug: str,
    session: Session = Depends(get_session),
):
    stmt = select(Tienda).where(Tienda.slug == slug)
    tienda = session.exec(stmt).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    return tienda


# ──────────────────────────────────────────────────────────────────────────────
# OBTENER / EDITAR TIENDA POR VENDEDOR (ID MANUAL)
#   GET  /tiendas/vendedor/{id_vendedor}
#   PUT  /tiendas/vendedor/{id_vendedor}
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/vendedor/{id_vendedor}", response_model=Tienda)
def obtener_tienda_por_vendedor(
    id_vendedor: int,
    session: Session = Depends(get_session),
):
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    stmt = select(Tienda).where(Tienda.vendedor_id == vendedor.id)
    tienda = session.exec(stmt).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="El vendedor no tiene tienda.")

    return tienda


@router.put("/vendedor/{id_vendedor}", response_model=Tienda)
def actualizar_tienda_por_vendedor(
    id_vendedor: int,
    payload: TiendaUpdate,
    session: Session = Depends(get_session),
):
    vendedor = session.exec(
        select(Vendedor).where(Vendedor.id_vendedor == id_vendedor)
    ).first()
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    stmt = select(Tienda).where(Tienda.vendedor_id == vendedor.id)
    tienda = session.exec(stmt).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="El vendedor no tiene tienda.")

    # Actualizar solo los campos enviados
    data = payload.dict(exclude_unset=True)
    # Si se cambia slug, validar que no se repita
    if "slug" in data:
        stmt_slug = select(Tienda).where(
            Tienda.slug == data["slug"], Tienda.id != tienda.id
        )
        slug_existente = session.exec(stmt_slug).first()
        if slug_existente:
            raise HTTPException(
                status_code=400,
                detail="El nuevo slug ya está en uso, elija otro.",
            )

    for campo, valor in data.items():
        setattr(tienda, campo, valor)

    tienda.updated_at = datetime.utcnow()

    session.add(tienda)
    session.commit()
    session.refresh(tienda)
    return tienda


# ──────────────────────────────────────────────────────────────────────────────
# ELIMINAR TIENDA POR SLUG
# DELETE /tiendas/{slug}
# ──────────────────────────────────────────────────────────────────────────────
@router.delete("/{slug}", status_code=204)
def eliminar_tienda_por_slug(
    slug: str,
    session: Session = Depends(get_session),
):
    stmt = select(Tienda).where(Tienda.slug == slug)
    tienda = session.exec(stmt).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    session.delete(tienda)
    session.commit()
    return None


@router.get("/{slug}/productos")
def listar_productos_por_tienda(
    slug: str,
    session: Session = Depends(get_session),
):
    # Obtener la tienda
    stmt = select(Tienda).where(Tienda.slug == slug)
    tienda = session.exec(stmt).first()

    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    # Obtener productos del vendedor dueño de la tienda
    from backend.Modelos.Producto import Producto
    stmt_prod = select(Producto).where(Producto.vendedor_id == tienda.vendedor_id)
    productos = session.exec(stmt_prod).all()

    return productos
