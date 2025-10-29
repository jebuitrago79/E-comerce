# backend/db/init_db_sqlite.py
from sqlmodel import SQLModel, Session
from backend.db.engine import engine
from backend.Modelos import Administrador, Comprador, Usuario, Vendedor, Producto, Categoria

def create_db_and_tables():
    print("🧱 Creando tablas SQLite...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas SQLite creadas correctamente.")

def seed_data():
    with Session(engine) as session:
        if not session.query(Administrador).first():
            admin = Administrador(nombre="AdminTest", correo="admin@test.com", contrasena="1234")
            cat = Categoria(nombre="Electrónica")
            vend = Vendedor(nombre="Juan", correo="juan@ventas.com", contrasena="abc")
            comp = Comprador(nombre="Pedro", correo="pedro@compras.com", contrasena="xyz")
            prod = Producto(nombre="Laptop", precio=2500.0, categoria_id=1, vendedor_id=1)

            session.add_all([admin, cat, vend, comp, prod])
            session.commit()
            print("🌱 Datos de prueba insertados.")
        else:
            print("ℹ️ Datos ya existen.")

if __name__ == "__main__":
    create_db_and_tables()
    seed_data()
