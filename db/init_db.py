from sqlmodel import SQLModel
from db.engine import engine


from Modelos.User import Usuario
from Modelos.Vendedor import Vendedor

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)