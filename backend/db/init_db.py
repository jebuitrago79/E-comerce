# backend/db/init_db.py
from sqlmodel import SQLModel
from sqlalchemy import text
from backend.db.engine import engine
from backend.Modelos import Administrador, Comprador, Usuario, Vendedor, Producto, Categoria

def ensure_categoria_unique_index():
    with engine.begin() as conn:
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'categorias_tenant_slug_key'
          ) THEN
            ALTER TABLE public.categorias
            ADD CONSTRAINT categorias_tenant_slug_key UNIQUE (tenant_id, slug);
          END IF;
        END $$;
        """)

def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    ensure_categoria_unique_index()
    print("✅ Tablas creadas correctamente.")

def test_connection():
    with engine.connect() as conn:
        row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
        print("✅ Conexión PostgreSQL OK:", row)
