# db/init_db.py
from sqlmodel import SQLModel
from db.engine import engine
from Modelos import Administrador, Comprador, Usuario, Vendedor  # importa tus modelos

def create_db_and_tables():
    """
    Crea todas las tablas definidas en los modelos SQLModel
    dentro de la base de datos conectada (Supabase o SQLite).
    """
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas creadas correctamente.")
