
from sqlmodel import Session, select
from db.engine import engine
from CRUD.Crud_Vendedor import crear_vendedor, listar_vendedores
from Modelos.User import Usuario


def seed_vendedores():
    vendedores_demo = [
        {
            "nombre": "Carlos Pérez",
            "email": "carlos@tienda.com",
            "password": "1234",
            "estado_cuenta": "activo",
            "id_vendedor": 1001,
            "empresa": "ElectroHogar",
            "direccion": "Cra 10 #20-30",
            "telefono": "3001112233",
        },
        {
            "nombre": "Laura Gómez",
            "email": "laura@store.com",
            "password": "5678",
            "estado_cuenta": "activo",
            "id_vendedor": 1002,
            "empresa": "Moda Urbana",
            "direccion": "Calle 45 #12-09",
            "telefono": "3015556677",
        },
    ]

    with Session(engine) as session:
        for v in vendedores_demo:
            existe = session.exec(select(Usuario).where(Usuario.email == v["email"])).first()
            if not existe:
                crear_vendedor(session, **v)
                print(f"✔ Vendedor creado: {v['nombre']} ({v['email']})")
            else:
                print(f"⚠ Vendedor ya existe: {v['email']}")

        print("\n== Vendedores actuales ==")
        for vend in listar_vendedores(session):
            print(f"- id={vend.id} | {vend.nombre} | {vend.empresa}")
