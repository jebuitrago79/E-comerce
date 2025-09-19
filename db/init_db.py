from sqlmodel import SQLModel
from db.engine import engine


from Modelos.Vendedor import Vendedor
from Modelos.Administrador import Administrador
from Modelos.Comprador import Comprador

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)