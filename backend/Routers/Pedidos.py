# backend/Routers/Pedidos.py
from typing import List, Optional, Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


class PedidoItem(BaseModel):
    producto_id: int
    nombre: str
    precio: float
    cantidad: int


class PedidoCreate(BaseModel):
    # 👉 NUEVO: comprador dueño del pedido
    comprador_id: int

    nombre_cliente: str
    email_cliente: str
    direccion: str
    telefono: Optional[str] = None
    metodo_pago: Literal["tarjeta", "contra_entrega"]
    total: float
    estado: str  # "pendiente_entrega", "entregado", etc.
    items: List[PedidoItem]


class PedidoRead(PedidoCreate):
    id: int


class PedidoUpdate(BaseModel):
    estado: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None


# “DB” en memoria solo para la simulación
_FAKE_PEDIDOS: List[PedidoRead] = []
_COUNTER_ID = 1


@router.post("/", response_model=PedidoRead)
def crear_pedido(payload: PedidoCreate):
    global _COUNTER_ID

    pedido = PedidoRead(id=_COUNTER_ID, **payload.model_dump())
    _COUNTER_ID += 1
    _FAKE_PEDIDOS.append(pedido)

    return pedido


@router.get("/", response_model=List[PedidoRead])
def listar_pedidos(comprador_id: Optional[int] = None):
    """
    Si viene comprador_id, solo devolvemos los pedidos de ese comprador.
    Si no viene, devolvemos todos (útil para debug o panel admin).
    """
    if comprador_id is None:
        return _FAKE_PEDIDOS

    return [p for p in _FAKE_PEDIDOS if p.comprador_id == comprador_id]


@router.put("/{pedido_id}", response_model=PedidoRead)
def actualizar_pedido(pedido_id: int, payload: PedidoUpdate):
    for idx, p in enumerate(_FAKE_PEDIDOS):
        if p.id == pedido_id:
            data = p.model_dump()
            if payload.estado is not None:
                data["estado"] = payload.estado
            if payload.direccion is not None:
                data["direccion"] = payload.direccion
            if payload.telefono is not None:
                data["telefono"] = payload.telefono

            actualizado = PedidoRead(**data)
            _FAKE_PEDIDOS[idx] = actualizado
            return actualizado

    raise HTTPException(status_code=404, detail="Pedido no encontrado")
