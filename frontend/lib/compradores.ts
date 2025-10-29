import { api } from "./api";

export interface Comprador {
  id_comprador: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  password?: string;
}

export const getCompradores = async (): Promise<Comprador[]> => {
  const { data } = await api.get("/compradores/");
  return data;
};

export const crearComprador = async (nuevo: Comprador) => {
  const { data } = await api.post("/compradores/", nuevo);
  return data;
};
