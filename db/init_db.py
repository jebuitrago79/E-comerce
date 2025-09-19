# db/init_db.py
from sqlmodel import SQLModel, Session
from db.engine import engine

# Importa tus modelos para que se creen las tablas
from Modelos.Vendedor import Vendedor
from Modelos.Administrador import Administrador
from Modelos.Comprador import Comprador


def create_db_and_tables():
    """Crea todas las tablas definidas en los modelos"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Provee una sesión de base de datos para usar en los endpoints"""
    with Session(engine) as session:
        yield session
