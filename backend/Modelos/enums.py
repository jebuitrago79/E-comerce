from enum import Enum


class EstadoCuenta(str, Enum):
    activo = "activo"
    desactivo = "desactivo"