from sqlmodel import SQLModel
from .engine import engine

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
