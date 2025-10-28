"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Field = {
  key: string;              // nombre EXACTO del campo en tu backend (ej: "nombre", "correo")
  label: string;            // etiqueta visible
  type?: "text" | "number"; // tipo de input
  required?: boolean;       // si es obligatorio para crear/actualizar
  width?: string;           // Tailwind width (ej: "w-40", "w-60"), opcional
};

type CrudPageProps = {
  title: string;
  baseUrl: string;               // ej: "/vendedores" o `/tenants/${TENANT}/usuarios`
  idKey?: string;                // por defecto "id"
  fields: Field[];               // campos para form/listado
  queryKey: string;              // clave para React Query (ej: "vendedores")
  listParams?: string;           // ej: "?limit=50&offset=0"
  buildCreatePayload?: (data: Record<string, any>) => any; // permitir transformar payload
  buildUpdatePayload?: (data: Record<string, any>) => any;
};

export default function CrudPage({
  title,
  baseUrl,
  idKey = "id",
  fields,
  queryKey,
  listParams = "",
  buildCreatePayload,
  buildUpdatePayload,
}: CrudPageProps) {
  const qc = useQueryClient();

  const [form, setForm] = React.useState<Record<string, any>>(
    Object.fromEntries(fields.map(f => [f.key, ""]))
  );
  const [editing, setEditing] = React.useState<Record<string, any> | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  // LIST
  const list = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const url = `${baseUrl}${listParams}`;
      const { data } = await api.get(url);
      // el backend a veces responde {items:[], total:...}
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return data;
    },
  });

  // CREATE
  const create = useMutation({
    mutationFn: async () => {
      setMsg(null);
      // validación rápida
      fields.forEach(f => {
        if (f.required && !String(form[f.key] ?? "").trim()) {
          throw new Error(`Falta ${f.label}`);
        }
      });
      const payload = buildCreatePayload ? buildCreatePayload(form) : form;
      const { data } = await api.post(baseUrl, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      setForm(Object.fromEntries(fields.map(f => [f.key, ""])));
      setMsg("✅ Creado correctamente.");
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail || err?.message || "Error al crear";
      setMsg(`❌ ${detail}`);
      alert(detail);
    },
  });

  // UPDATE
  const update = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const id = editing[idKey];
      const payload = buildUpdatePayload ? buildUpdatePayload(editing) : editing;
      const { data } = await api.put(`${baseUrl}/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      setEditing(null);
      setMsg("✅ Actualizado.");
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail || err?.message || "Error al actualizar";
      setMsg(`❌ ${detail}`);
      alert(detail);
    },
  });

  // DELETE
  const remove = useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.delete(`${baseUrl}/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      setMsg("🗑️ Eliminado.");
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail || err?.message || "Error al eliminar";
      setMsg(`❌ ${detail}`);
      alert(detail);
    },
  });

  return (
    <div className="grid gap-4">
      <section className="bg-white rounded-xl border p-5">
        <h1 className="text-xl font-bold mb-3">{title}</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {fields.map((f) => (
            <input
              key={f.key}
              className={`border rounded px-3 py-2 ${f.width ?? "w-60"}`}
              placeholder={f.label}
              value={form[f.key] ?? ""}
              onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
              type={f.type === "number" ? "number" : "text"}
            />
          ))}
          <button
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {create.isPending ? "Creando..." : "Crear"}
          </button>
        </div>
        {msg && <p className="text-sm text-gray-600 mt-2">{msg}</p>}
      </section>

      <section className="bg-white rounded-xl border p-5">
        {list.isLoading ? (
          <p>Cargando…</p>
        ) : list.error ? (
          <p className="text-red-600">Error al cargar datos.</p>
        ) : Array.isArray(list.data) && list.data.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2">ID</th>
                  {fields.map((f) => (
                    <th key={f.key} className="py-2">{f.label}</th>
                  ))}
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((row: any) => (
                  <tr key={row[idKey]} className="border-t">
                    <td className="py-2">{row[idKey]}</td>
                    {fields.map((f) => (
                      <td key={f.key} className="py-2">{row[f.key] as any}</td>
                    ))}
                    <td className="py-2 flex gap-2">
                      <button
                        onClick={() => setEditing(row)}
                        className="px-3 py-1 rounded border hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar registro?")) remove.mutate(row[idKey]);
                        }}
                        className="px-3 py-1 rounded border text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No hay datos.</p>
        )}
      </section>

      {editing && (
        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Editar #{editing[idKey]}</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            {fields.map((f) => (
              <input
                key={f.key}
                className={`border rounded px-3 py-2 ${f.width ?? "w-60"}`}
                value={editing[f.key] ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
                placeholder={f.label}
                type={f.type === "number" ? "number" : "text"}
              />
            ))}
            <button
              onClick={() => update.mutate()}
              className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={update.isPending}
            >
              {update.isPending ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded border"
            >
              Cancelar
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
