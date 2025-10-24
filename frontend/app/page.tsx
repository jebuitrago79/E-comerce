"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const TENANT = process.env.NEXT_PUBLIC_TENANT_ID; // string

type Categoria = {
  id: number;
  tenant_id: number;
  slug: string;
  nombre: string;
  descripcion?: string | null;
};

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ slug: "", nombre: "", descripcion: "" });
  const [msg, setMsg] = React.useState<string | null>(null);

  // LISTAR
  const categorias = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data } = await api.get<Categoria[]>(`/tenants/${TENANT}/categorias`);
      return data;
    },
  });

  // CREAR
  const crear = useMutation({
    mutationFn: async () => {
      setMsg(null);
      // Validación básica en cliente
      if (!form.slug.trim() || !form.nombre.trim()) {
        throw new Error("Completa slug y nombre.");
      }
      const payload = {
        slug: form.slug.trim(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
      };
      const url = `/tenants/${TENANT}/categorias`;
      console.log("POST", url, payload);
      const { data } = await api.post(url, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      setForm({ slug: "", nombre: "", descripcion: "" });
      setMsg("✅ Categoría creada.");
    },
    onError: (err: any) => {
      console.error("Error creando categoría:", err);
      // Muestra detalle del backend si viene
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Error desconocido creando la categoría.";
      setMsg(`❌ ${detail}`);
      alert(`Error: ${detail}`); // para que lo veas inmediatamente
    },
  });

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Categorías</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          placeholder="slug (ej: ropa)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          placeholder="nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          placeholder="descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <button
          onClick={() => crear.mutate()}
          disabled={!form.slug || !form.nombre || crear.isPending}
        >
          {crear.isPending ? "Creando..." : "Crear"}
        </button>
      </div>

      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      {categorias.isLoading && <p>Cargando...</p>}
      {categorias.error && (
        <p style={{ color: "red" }}>
          Error al cargar categorías (revisa consola).
        </p>
      )}

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">ID</th>
            <th align="left">Slug</th>
            <th align="left">Nombre</th>
            <th align="left">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {categorias.data?.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.slug}</td>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
