from sqlmodel import create_engine
DATABASE_URL = ("sqlite:///./app1"".db")
engine = create_engine("sqlite:///./app.db", echo=True, connect_args={"check_same_thread": False})