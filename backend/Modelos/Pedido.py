# backend/Modelos/Pedido.py
from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field
import json

class ItemPedido(SQLModel):
    producto_id: int
    nombre: str
    precio: float
    cantidad: int

class PedidoBase(SQLModel):
    nombre_cliente: str
    email_cliente: str
    direccion: str
    telefono: Optional[str] = None
    metodo_pago: str  # "tarjeta", "contra_entrega", etc.
    total: float
    estado: str = Field(default="pendiente_entrega")  # pendiente_pago, entregado, etc.

class Pedido(PedidoBase, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    items_json: str = Field(description="JSON con los productos del pedido")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # helper para leer items
    def items(self) -> List[ItemPedido]:
        data = json.loads(self.items_json)
        return [ItemPedido(**d) for d in data]
