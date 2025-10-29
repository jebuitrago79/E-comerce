from sqlmodel import SQLModel
from backend.db.engine import engine
from sqlalchemy import text
from backend.Modelos import Administrador, Comprador, Usuario, Vendedor, Producto, Categoria

def ensure_categoria_tables_and_columns():
    with engine.begin() as conn:
        url = str(engine.url)

        # Tabla categorias
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER NOT NULL,
          slug TEXT NOT NULL,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        if "sqlite" not in url:
            # Solo PostgreSQL
            conn.exec_driver_sql("""
            CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON public.categorias(tenant_id);
            CREATE INDEX IF NOT EXISTS idx_categorias_slug ON public.categorias(slug);
            """)

def ensure_producto_optional_columns():
    with engine.begin() as conn:
        conn.exec_driver_sql("ALTER TABLE productos ADD COLUMN IF NOT EXISTS external_id TEXT;")
        conn.exec_driver_sql("ALTER TABLE productos ADD COLUMN IF NOT EXISTS source TEXT;")
        conn.exec_driver_sql("ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
        conn.exec_driver_sql("ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")

def drop_legacy_categoria_column_and_type():
    with engine.begin() as conn:
        conn.exec_driver_sql("PRAGMA foreign_keys=off;")
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS temp_productos AS SELECT * FROM productos;
        """)
        conn.exec_driver_sql("PRAGMA foreign_keys=on;")

def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    ensure_categoria_tables_and_columns()
    drop_legacy_categoria_column_and_type()
    ensure_producto_optional_columns()
    print("✅ Tablas creadas y estructura de categorías verificada.")

def test_connection():
    with engine.connect() as conn:
        url = str(engine.url)
        if url.startswith("sqlite"):
            row = conn.execute(text("SELECT sqlite_version();")).first()
            print("✅ Conexión SQLite OK:", row)
        else:
            row = conn.execute(text("SELECT current_user, inet_server_addr(), inet_server_port();")).first()
            print("✅ Conexión PostgreSQL OK:", row)
