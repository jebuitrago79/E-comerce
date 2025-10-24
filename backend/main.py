# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from Routers import vendedores, Administradores, Compradores
from db.init_db import create_db_and_tables, test_connection
from Routers import Productos as productos_router
from Routers import Categoria as categorias_router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ✅ Arranque de la app: verifica conexión y crea tablas si no existen
    print(" Verificando conexión a la BD...")
    test_connection()
    print(" Creando tablas si no existen...")
    create_db_and_tables()
    print("Startup listo.")
    yield
    # (Opcional) aquí liberar recursos al apagar la app


app = FastAPI(title="API E-commerce", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API E-commerce"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
