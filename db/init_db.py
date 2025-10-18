# db/init_db.py
from sqlmodel import SQLModel, Session
from .engine import engine

# importa modelos (¡importa, no uses!)
from Modelos.Vendedor import Vendedor  # noqa
from Modelos.Administrador import Administrador  # noqa
# si tienes más, impórtalos igual

def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
