# db/init_db.py
from sqlmodel import SQLModel, Session
from db.engine import engine
from Modelos import Administrador, Comprador, Usuario, Vendedor, Producto # importa tus modelos

def create_db_and_tables():
    """
    Crea todas las tablas definidas en los modelos SQLModel
    dentro de la base de datos conectada (Supabase o SQLite).
    """
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas creadas correctamente.")
def get_db():
    """
    Crea una sesión temporal de base de datos que se
    usa como dependencia en los endpoints de FastAPI.
    """
    with Session(engine) as session:
        yield session