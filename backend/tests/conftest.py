# backend/tests/conftest.py
import os
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlmodel import create_engine, Session
from backend.main import app
from backend.db.engine import get_session as real_get_session

# Engine de pruebas (SQLite en memoria)
TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})

def get_test_session():
    with Session(engine) as session:
        yield session

@pytest.fixture(scope="session", autouse=True)
def _prepare_db():
    # Crear tablas en SQLite para los tests
    SQLModel.metadata.create_all(engine)
    yield
    # (opcional) no hace falta dropear al ser :memory:

@pytest.fixture(scope="session")
def client():
    # Override de la dependencia de sesión para que la API use SQLite durante los tests
    app.dependency_overrides[real_get_session] = get_test_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

