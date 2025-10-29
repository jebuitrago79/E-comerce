export type Estado = "activo" | "inactivo";

/** Vendedor según tu backend (id manual) */
export interface Vendedor {
  id: number;                 // mapeado desde id_vendedor al listar
  nombre: string;
  email: string;
  password?: string;
  telefono?: string | null;
  empresa?: string | null;
  direccion?: string | null;
  estado_cuenta: Estado;
}

/** Comprador */
export interface Comprador {
  id: number;
  nombre: string;
  email: string;
  password?: string;
}

/** Categoría */
export interface Categoria {
  id: number;
  slug: string;
  nombre: string;
  descripcion?: string | null;
}

/** Administrador */
export interface Administrador {
  id_admin: number;
  nombre: string;
  email: string;
  password?: string;
  nivel_acceso: number;
  estado_cuenta: Estado;
}
