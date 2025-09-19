from sqlmodel import create_engine

DATABASE_URL = "sqlite:///./E-comerce.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})