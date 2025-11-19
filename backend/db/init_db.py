# backend/db/init_db.py
from sqlmodel import SQLModel
from sqlalchemy import text
from backend.db.engine import engine
# Importa todos los modelos para que SQLModel.metadata tenga las tablas
from backend.Modelos import Administrador, Comprador, Usuario, Vendedor, Producto, Categoria, Tienda

def ensure_constraints():
    """Crea constraints/índices que tu modelo declara pero que quizá no existen aún.
       Idempotente: solo los crea si no existen.
       Ajustado a tus modelos actuales (sin tenant_id/slug en categorias).
    """
    with engine.begin() as conn:
        # Unicidad en vendedores.email (si no existe)
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uq_vendedores_email'
          ) THEN
            ALTER TABLE public.vendedores
              ADD CONSTRAINT uq_vendedores_email UNIQUE (email);
          END IF;
        EXCEPTION WHEN undefined_table THEN
          -- SQLite u otro motor: ignorar
          NULL;
        END $$;
        """)

        # Unicidad en compradores.email (si decidiste aplicarla en el modelo)
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uq_compradores_email'
          ) THEN
            ALTER TABLE public.compradores
              ADD CONSTRAINT uq_compradores_email UNIQUE (email);
          END IF;
        EXCEPTION WHEN undefined_table THEN
          NULL;
        END $$;
        """)

        # Unicidad en categorias.nombre
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uq_categorias_nombre'
          ) THEN
            ALTER TABLE public.categorias
              ADD CONSTRAINT uq_categorias_nombre UNIQUE (nombre);
          END IF;
        EXCEPTION WHEN undefined_table THEN
          NULL;
        END $$;
        """)

def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)
    # Si la base es Postgres, esto añadirá (si faltan) las constraints
    try:
        ensure_constraints()
    except Exception as e:
        # En SQLite o si faltan tablas, no rompas el arranque
        print("⚠️ Aviso ensure_constraints:", repr(e))
    print("✅ Tablas creadas correctamente.")

def test_connection():
    """Health-check seguro: si es Postgres, da detalles; si es SQLite u otro, hace un SELECT 1."""
    with engine.connect() as conn:
        try:
            row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
            print("✅ Conexión PostgreSQL OK:", row)
        except Exception:
            # Fallback cross-DB
            row = conn.execute(text("select 1")).first()
            print("✅ Conexión OK (generic):", row)

