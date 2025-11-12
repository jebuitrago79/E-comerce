# backend/db/engine.py
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Permite trabajar sin .env en local (opcional). Si no quieres fallback, quita esta línea:
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./local.db"

# Normalización: aceptar "ppostgresql://" o "postgresql://"
if DATABASE_URL.startswith("ppostgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("ppostgresql://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

# Validación de formatos admitidos
if not (
    DATABASE_URL.startswith("postgresql+psycopg2://")
    or DATABASE_URL.startswith("sqlite:///")
    or DATABASE_URL.startswith("sqlite:///")
):
    raise ValueError(f"Formato inválido de DATABASE_URL: {DATABASE_URL}")

# Log seguro (oculta password)
try:
    safe_url = make_url(DATABASE_URL).set(password="***")
except Exception:
    safe_url = DATABASE_URL
print(f">>> DB_URL_USADA: {safe_url}")

# Crear engine (pre_ping para evitar conexiones muertas)
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

# Generador de sesión (expire_on_commit=False para no expirar objetos tras commit)
def get_session():
    with Session(engine, expire_on_commit=False) as session:
        yield session
