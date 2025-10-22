# db/init_db.py
from sqlmodel import SQLModel
from db.engine import engine
# importa los modelos para que queden registrados en el metadata
from Modelos import Administrador, Comprador, Usuario, Vendedor, Producto
from sqlalchemy import text

def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas creadas correctamente.")

def test_connection():
    with engine.connect() as conn:
        row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
        print("✅ Conexión OK:", row)
