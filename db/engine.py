# db/engine.py
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL no encontrada en .env")

# Normaliza por si hubo errores viejos
if DATABASE_URL.startswith("ppostgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("ppostgresql://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

if not DATABASE_URL.startswith("postgresql+psycopg2://"):
    raise ValueError(f"Formato inválido de DATABASE_URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session


