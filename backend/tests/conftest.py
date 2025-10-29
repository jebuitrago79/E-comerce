import pytest
from backend.db.init_db import create_db_and_tables
from backend.db.engine import engine
from sqlmodel import Session, select
from backend.Modelos import Administrador


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Este fixture se ejecuta automáticamente antes de todos los tests.
    Crea las tablas necesarias en la base de datos de prueba.
    """
    print("\n🧩 Inicializando base de datos de prueba...")
    create_db_and_tables()
    yield
    print("\n🧹 Finalizando tests.")


@pytest.fixture(scope="function", autouse=True)
def seed_basic_data():
    """
    Este fixture opcional inserta datos básicos antes de cada test,
    para evitar errores de tablas vacías o constraints NOT NULL.
    """
    with Session(engine) as session:
        # Verifica si ya existe un administrador
        admin_exists = session.exec(select(Administrador)).first()
        if not admin_exists:
            admin = Administrador(
                nombre="AdminTest",
                email="admin@test.com",
                password="12345",
                nivel_acceso="superadmin",
                estado_cuenta="activo"
            )
            session.add(admin)
            session.commit()
