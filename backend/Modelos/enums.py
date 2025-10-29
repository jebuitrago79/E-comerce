from enum import Enum

class CategoriaProducto(str, Enum):
    ropa = "ropa"
    tecnologia = "tecnologia"
    comida = "comida"
    deportes = "deportes"
    otros = "otros"

class EstadoCuenta(str, Enum):
    activo = "activo"
    desactivo = "desactivo"