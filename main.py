from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.init_db import create_db_and_tables
from Routers import vendedores, Administradores

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="API E-comerce", lifespan=lifespan)
app.include_router(vendedores.router)
app.include_router(Administradores.router)
@app.get("/")
def root():
    return {"ok": True}