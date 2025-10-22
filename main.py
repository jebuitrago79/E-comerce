# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

from Routers import vendedores, Administradores, Compradores, Productos
from db.init_db import create_db_and_tables, test_connection


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

# Routers
app.include_router(vendedores.router)
app.include_router(Administradores.router)
app.include_router(Compradores.router)
app.include_router(Productos.router)


@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API E-commerce"}


# ❌ Quita el on_event para evitar ejecución doble
# @app.on_event("startup")
# def on_startup():
#     create_db_and_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
