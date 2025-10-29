import { api } from "./api";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get("/categorias/");
  return data;
};
