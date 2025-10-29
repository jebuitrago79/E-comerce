from backend.db.engine import engine
from sqlmodel import text

def test_connection():
    with engine.connect() as conn:
        row = conn.execute(text("select current_user, inet_server_addr(), inet_server_port();")).first()
        assert row is not None
        print("✅ Conexión OK:", row)

