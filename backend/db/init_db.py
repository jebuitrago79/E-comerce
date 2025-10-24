# db/init_db.py
from sqlmodel import SQLModel
from db.engine import engine
from sqlalchemy import text

# Importa modelos para registrar el metadata de SQLModel
# Asegúrate que Modelos/__init__.py exporte Categoria
from Modelos import Administrador, Comprador, Usuario, Vendedor, Producto, Categoria


def ensure_categoria_tables_and_columns():
    """
    Crea 'categorias' si no existe y asegura 'tenant_id' y 'category_id' en 'productos'
    más la FK productos.category_id -> categorias.id
    """
    with engine.begin() as conn:
        # 1) Tabla categorias
        conn.exec_driver_sql("""
        CREATE TABLE IF NOT EXISTS public.categorias (
          id serial PRIMARY KEY,
          tenant_id integer NOT NULL,
          slug varchar(100) NOT NULL,
          nombre varchar(100) NOT NULL,
          descripcion varchar(255),
          created_at timestamp without time zone DEFAULT now(),
          updated_at timestamp without time zone DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON public.categorias(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_categorias_slug ON public.categorias(slug);
        """)

        # 2) tenant_id en productos
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='tenant_id'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN tenant_id integer;
            CREATE INDEX IF NOT EXISTS idx_productos_tenant ON public.productos(tenant_id);
          END IF;
        END $$;
        """)

        # 3) category_id en productos
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='category_id'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN category_id integer NULL;
          END IF;
        END $$;
        """)

        # 4) FK category_id -> categorias.id
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_productos_category_id_categorias'
          ) THEN
            ALTER TABLE public.productos
            ADD CONSTRAINT fk_productos_category_id_categorias
            FOREIGN KEY (category_id) REFERENCES public.categorias(id)
            ON UPDATE CASCADE ON DELETE SET NULL;
          END IF;
        END $$;
        """)


def ensure_producto_optional_columns():
    """
    Asegura columnas opcionales de Producto:
    - external_id text (index)
    - source text (index)
    - created_at timestamp default now()
    - updated_at timestamp default now()
    """
    with engine.begin() as conn:
        # external_id
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='external_id'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN external_id text NULL;
            CREATE INDEX IF NOT EXISTS idx_productos_external_id ON public.productos(external_id);
          END IF;
        END $$;
        """)

        # source
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='source'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN source text NULL;
            CREATE INDEX IF NOT EXISTS idx_productos_source ON public.productos(source);
          END IF;
        END $$;
        """)

        # created_at
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='created_at'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN created_at timestamp without time zone DEFAULT now();
          END IF;
        END $$;
        """)

        # updated_at
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='updated_at'
          ) THEN
            ALTER TABLE public.productos ADD COLUMN updated_at timestamp without time zone DEFAULT now();
          END IF;
        END $$;
        """)

def drop_legacy_categoria_column_and_type():
    """
    Elimina la columna legacy 'categoria' en 'productos' (ENUM) si existe,
    y borra el tipo 'categoria_enum' si ya no lo usa ninguna tabla.
    """
    with engine.begin() as conn:
        # 1) Drop column productos.categoria si existe
        conn.exec_driver_sql("""
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='productos' AND column_name='categoria'
          ) THEN
            ALTER TABLE public.productos DROP COLUMN categoria;
          END IF;
        END $$;
        """)

        # 2) Drop type categoria_enum si no está en uso
        conn.exec_driver_sql("""
        DO $$
        DECLARE
          in_use boolean;
        BEGIN
          -- ¿Hay alguna columna (no eliminada) que use el tipo categoria_enum?
          SELECT EXISTS (
            SELECT 1
            FROM pg_attribute a
            JOIN pg_class c ON a.attrelid = c.oid
            JOIN pg_type  t ON a.atttypid = t.oid
            WHERE t.typname = 'categoria_enum'
              AND a.attnum > 0
              AND NOT a.attisdropped
          ) INTO in_use;

          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_enum') AND NOT in_use THEN
            DROP TYPE categoria_enum;
          END IF;
        END $$;
        """)



def create_db_and_tables():
    print("🛠️ Creando tablas en la base de datos (si no existen)...")
    SQLModel.metadata.create_all(engine)

    # Estructura categorías + columnas core en productos
    ensure_categoria_tables_and_columns()

    # ❗️Eliminar columna legacy 'categoria' y tipo ENUM si quedaron
    drop_legacy_categoria_column_and_type()

    # Columnas opcionales (external_id, source, timestamps)
    ensure_producto_optional_columns()

    print("✅ Tablas creadas y estructura de categorías verificada.")


def test_connection():
    with engine.connect() as conn:
        row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
        print("✅ Conexión OK:", row)

