# db/engine.py (tal como lo tienes, solo añado pre_ping por estabilidad con pooler)
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no encontrada en .env")

if DATABASE_URL.startswith("ppostgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("ppostgresql://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

if not DATABASE_URL.startswith("postgresql+psycopg2://"):
    raise ValueError(f"Formato inválido de DATABASE_URL: {DATABASE_URL}")

# Log útil (sin contraseña)
print(">>> DB_URL_USADA:", make_url(DATABASE_URL).set(password="***"))

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # recomendado con pgbouncer
)

def get_session():
    with Session(engine) as session:
        yield session


