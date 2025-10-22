from enum import Enum

class CategoriaProducto(str, Enum):
    ropa = "ropa"
    tecnologia = "tecnologia"
    comida = "comida"
    deportes = "deportes"
    otros = "otros"
