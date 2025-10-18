# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.init_db import create_db_and_tables
from Routers import vendedores, Administradores


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="API E-commerce", lifespan=lifespan)

app.include_router(vendedores.router)
app.include_router(Administradores.router)


@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API E-commerce"}


# === ESTA ES LA PARTE IMPORTANTE ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",           # módulo:variable
        host="127.0.0.1",     # dirección local
        port=8000,            # puerto
        reload=True           # autorecarga si cambias el código
    )
