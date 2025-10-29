# backend/db/engine.py
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no encontrada en .env")

# Compatibilidad con PostgreSQL (normal o con "ppostgresql" usado por algunos entornos)
if DATABASE_URL.startswith("ppostgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("ppostgresql://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

# Validar formatos admitidos
if not (
    DATABASE_URL.startswith("postgresql+psycopg2://")
    or DATABASE_URL.startswith("sqlite:///")
    or DATABASE_URL.startswith("sqlite:///")
):
    raise ValueError(f"Formato inválido de DATABASE_URL: {DATABASE_URL}")

# Log sin contraseña
try:
    safe_url = make_url(DATABASE_URL).set(password="***")
except Exception:
    safe_url = DATABASE_URL
print(f">>> DB_URL_USADA: {safe_url}")

# Crear el engine
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # evita conexiones rotas
)

# Generador de sesión
def get_session():
    with Session(engine) as session:
        yield session
