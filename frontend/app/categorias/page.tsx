"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { errorToText } from "@/lib/httpError";

const TENANT = process.env.NEXT_PUBLIC_TENANT_ID as string;

type Categoria = {
  id: number;
  tenant_id: number;
  slug: string;
  nombre: string;
  descripcion?: string | null;
};

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [f, setF] = React.useState({ slug: "", nombre: "", descripcion: "" });

  const categorias = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => (await api.get<Categoria[]>(`/tenants/${TENANT}/categorias`)).data,
  });

  const crear = useMutation({
    mutationFn: async () => {
      setMsg(null);
      if (!f.slug.trim() || !f.nombre.trim()) throw new Error("Completa slug y nombre.");
      const payload = { slug: f.slug.trim(), nombre: f.nombre.trim(), descripcion: f.descripcion.trim() || null };
      return (await api.post(`/tenants/${TENANT}/categorias`, payload)).data;
    },
    onSuccess: () => {
      setMsg("✅ Categoría creada");
      setF({ slug: "", nombre: "", descripcion: "" });
      qc.invalidateQueries({ queryKey: ["categorias"] });
    },
    onError: (e) => setMsg(`❌ ${errorToText(e)}`),
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/tenants/${TENANT}/categorias/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Categorías</h1>

      <div className="bg-white/5 p-4 rounded-lg space-x-2">
        <input placeholder="slug" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
        <input placeholder="nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <input placeholder="descripción" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} />
        <button onClick={() => crear.mutate()} disabled={crear.isPending}>Crear</button>
        {msg && <p className="mt-2">{msg}</p>}
      </div>

      <div className="overflow-x-auto bg-white/5 rounded-lg">
        <table className="w-full">
          <thead><tr><th className="text-left p-2">ID</th><th className="text-left p-2">Slug</th><th className="text-left p-2">Nombre</th><th className="text-left p-2">Descripción</th><th/></tr></thead>
          <tbody>
            {categorias.data?.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.slug}</td>
                <td className="p-2">{c.nombre}</td>
                <td className="p-2">{c.descripcion}</td>
                <td className="p-2">
                  <button className="text-red-500" onClick={() => eliminar.mutate(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

