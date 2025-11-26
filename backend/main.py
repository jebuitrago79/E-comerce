# main.py
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from backend.Routers import vendedores, Administradores, Compradores
from backend.Routers import Productos as productos_router
from backend.Routers import Categoria as categorias_router
from backend.Routers import Tienda
from backend.Routers import Pedidos


# Init DB (una sola fuente de verdad)
from backend.db.init_db import create_db_and_tables, test_connection


TESTING = os.getenv("TESTING") == "1"
# ──────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Solo corre tareas de startup si no estamos en modo test
    if not TESTING:
        print(" Verificando conexión a la BD...")
        test_connection()  # seguro: hace fallback a SELECT 1 en no-Postgres
        print(" Creando tablas si no existen...")
        create_db_and_tables()
        print("Startup listo.")
    else:
        print("🧪 TESTING=1 → Omitiendo test_connection() y create_db_and_tables().")
    yield


app = FastAPI(
    title="API E-commerce",
    lifespan=None if TESTING else lifespan  # en test, ni siquiera adjuntamos lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://tuappfront.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(vendedores.router)
app.include_router(Administradores.router)
app.include_router(Compradores.router)
app.include_router(productos_router.router)
app.include_router(categorias_router.router)
app.include_router(Tienda.router)
app.include_router(Pedidos.router)

# Rutas simples
@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API E-commerce"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
