import { api } from "./api";

export interface Vendedor {
  id_vendedor: number;
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  direccion?: string;
  password?: string;
  estado_cuenta?: string;
}

export const getVendedores = async (): Promise<Vendedor[]> => {
  const { data } = await api.get("/vendedores/");
  return data;
};

export const crearVendedor = async (nuevo: Vendedor) => {
  const { data } = await api.post("/vendedores/", nuevo);
  return data;
};

export const eliminarVendedor = async (id: number) => {
  await api.delete(`/vendedores/${id}`);
};

// 🔐 LOGIN VENDEDOR
export const loginVendedor = async (email: string, password: string) => {
  const { data } = await api.post<Vendedor>("/vendedores/login", {
    email,
    password,
  });
  return data; // VendedorRead
};