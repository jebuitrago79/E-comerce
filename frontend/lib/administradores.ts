// lib/administradores.ts
import { api } from "./api";

export interface Administrador {
  id: number;
  nombre: string;
  email: string;
  nivel_acceso?: number;
  estado_cuenta?: string;
}

export type AdminLoginResponse = {
  id: number;
  nombre: string;
  email: string;
  nivel_acceso?: number;
  estado_cuenta: "activo" | "bloqueado" | string;
};

export const loginAdministrador = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  try {
    const { data } = await api.post<AdminLoginResponse>(
      "/administradores/login",
      { email, password }
    );
    return data;
  } catch (err: any) {
    if (err?.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail as string | undefined;

      if (status === 401) {
        throw new Error(detail || "Credenciales inválidas.");
      }

      if (status === 403) {
        throw new Error(detail || "Su cuenta de administrador no está activa.");
      }

      throw new Error(
        detail || "No se pudo iniciar sesión. Intente nuevamente."
      );
    }

    throw new Error(
      "No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo."
    );
  }
};
