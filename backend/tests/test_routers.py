from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_admins():
    response = client.get("/administradores/")
    assert response.status_code == 200

def test_get_categorias():
    response = client.get("/categorias/")
    assert response.status_code == 200

def test_get_compradores():
    response = client.get("/compradores/")
    assert response.status_code == 200

def test_get_productos():
    response = client.get("/productos/")
    assert response.status_code == 200

def test_get_vendedores():
    response = client.get("/vendedores/")
    assert response.status_code == 200
