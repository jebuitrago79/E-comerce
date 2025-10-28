export type Categoria = {
  id: number;
  tenant_id: number;
  slug: string;
  nombre: string;
  descripcion?: string | null;
};
