# db/init_db.py
from sqlmodel import SQLModel
from db.engine import engine
from sqlalchemy import text

# Asegura que los modelos estén importados para registrar metadata
from Modelos import Administrador, Comprador, Usuario, Vendedor, Producto
from Modelos.Producto import CategoriaEnum  # <- lo usamos para los valores del ENUM

def _ensure_categoria_enum_and_column():
    """
    Garantiza (idempotente) que:
      - exista el tipo ENUM categoria_enum
      - tenga todos los valores de CategoriaEnum
      - exista la columna productos.categoria de ese tipo y NOT NULL
    """
    enum_name = "categoria_enum"
    enum_vals = [e.value for e in CategoriaEnum]  # ['ropa','tecnologia','comida','deportes']

    with engine.begin() as conn:
        # 1) Crear el tipo si no existe
        conn.exec_driver_sql(f"""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}') THEN
                EXECUTE 'CREATE TYPE {enum_name} AS ENUM ({", ".join(["''" + v + "''" for v in enum_vals])})';
            END IF;
        END $$;
        """)

        # 2) Asegurar que estén todos los valores del enum
        for val in enum_vals:
            conn.exec_driver_sql(f"ALTER TYPE {enum_name} ADD VALUE IF NOT EXISTS '{val}';")

        # 3) Agregar la columna si no existe (con default temporal), luego quitar default
        conn.exec_driver_sql(f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name   = 'productos'
                  AND column_name  = 'categoria'
            ) THEN
                EXECUTE 'ALTER TABLE public.productos ADD COLUMN categoria {enum_name} NOT NULL DEFAULT ''{enum_vals[0]}''';
                EXECUTE 'ALTER TABLE public.productos ALTER COLUMN categoria DROP DEFAULT';
            END IF;
        END $$;
        """)

def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    # ⬇️ Asegura enum y columna 'categoria' aunque la tabla exista de antes
    _ensure_categoria_enum_and_column()
    print("✅ Tablas creadas correctamente (y columna categoria verificada).")

def test_connection():
    with engine.connect() as conn:
        row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
        print("✅ Conexión OK:", row)
