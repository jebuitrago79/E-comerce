// lib/compradores.ts
import { api } from "./api";


export interface Comprador {
  id: number;
  id_comprador?: number;
  nombre: string;
  email: string;
  direccion?: string | null;
  telefono?: string | null;
  estado_cuenta?: string;
}



export type CompradorLoginResponse = {
  id: number;
  id_comprador?: number;
  nombre: string;
  email: string;
  estado_cuenta: "activo" | "bloqueado" | string;
  direccion?: string | null;
  telefono?: string | null;
};

export const loginComprador = async (
  email: string,
  password: string
): Promise<CompradorLoginResponse> => {
  try {
    const { data } = await api.post<CompradorLoginResponse>(
      "/compradores/login",
      { email, password }
    );
    return data;
  } catch (err: any) {
    // Si viene respuesta del backend
    if (err?.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail as string | undefined;

      if (status === 401) {
        // credenciales incorrectas
        throw new Error(detail || "Credenciales inválidas.");
      }

      if (status === 403) {
        // cuenta bloqueada / inactiva
        throw new Error(detail || "Su cuenta no está activa.");
      }

      // Otros errores con respuesta del backend
      throw new Error(
        detail || "No se pudo iniciar sesión. Intente nuevamente."
      );
    }

    // Errores de red / servidor caído
    throw new Error(
      "No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo."
    );
  }
};

// 🆕 REGISTRO DE COMPRADOR
export const registerComprador = async (payload: {
  id_comprador: string;          // 👈 AÑADIDO
  nombre: string;
  email: string;
  password: string;
  direccion?: string;
  telefono?: string;
}): Promise<Comprador> => {
  try {
    const { data } = await api.post<Comprador>("/compradores/", payload);
    return data;
  } catch (err: any) {
    if (err?.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail as string | undefined;

      if (status === 400) {
        // Por ejemplo, email o id_comprador ya registrado
        throw new Error(detail || "Email o id_comprador duplicado.");
      }

      throw new Error(
        detail ||
          "Ocurrió un error al registrar al comprador. Intente de nuevo."
      );
    }

    throw new Error(
      "No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente."
    );
  }
};