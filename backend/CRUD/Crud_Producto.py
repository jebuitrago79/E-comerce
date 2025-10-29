from sqlalchemy.orm import Session
from backend.Modelos.Producto import Producto

def crear_producto(db: Session, producto_data):
    nuevo_producto = Producto(**producto_data)
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

def obtener_productos(db: Session):
    return db.query(Producto).all()

def obtener_producto_por_id(db: Session, producto_id: int):
    return db.query(Producto).filter(Producto.id == producto_id).first()

def actualizar_producto(db: Session, producto_id: int, nuevos_datos: dict):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if producto:
        for key, value in nuevos_datos.items():
            setattr(producto, key, value)
        db.commit()
        db.refresh(producto)
    return producto

def eliminar_producto(db: Session, producto_id: int):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if producto:
        db.delete(producto)
        db.commit()
    return producto
