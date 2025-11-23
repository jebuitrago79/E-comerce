// lib/vendedores.ts
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

// 🔐 LOGIN VENDEDOR CON EXCEPCIONES CLARAS
export const loginVendedor = async (
  email: string,
  password: string
): Promise<Vendedor> => {
  try {
    const { data } = await api.post<Vendedor>("/vendedores/login", {
      email,
      password,
    });
    return data;
  } catch (err: any) {
    // Hay respuesta del backend
    if (err?.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail as string | undefined;

      if (status === 401) {
        // Credenciales incorrectas
        throw new Error(detail || "Credenciales inválidas.");
      }

      if (status === 403) {
        // Cuenta bloqueada / inactiva
        throw new Error(detail || "Su cuenta no está activa.");
      }

      // Otros errores de backend
      throw new Error(
        detail || "No se pudo iniciar sesión. Intente nuevamente."
      );
    }

    // Error de red / servidor caído
    throw new Error(
      "No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo."
    );
  }
};
