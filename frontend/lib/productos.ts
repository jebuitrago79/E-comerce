import { api } from "./api";

export interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria_id?: number;
  vendedor_id?: number;
}

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get("/productos/");
  return data;
};

export const crearProducto = async (nuevo: Producto) => {
  const { data } = await api.post("/productos/", nuevo);
  return data;
};
