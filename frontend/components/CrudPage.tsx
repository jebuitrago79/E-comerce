"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import React from "react";

type CrudConfig = {
  title: string;
  listUrl: string;
  createUrl: string;
  deleteUrl: (id: number) => string;
  fields: { name: string; label: string; type?: string; required?: boolean }[];
  idKey?: string; // por si la API usa otro nombre
};

export default function CrudPage({ config }: { config: CrudConfig }) {
  const qc = useQueryClient();
  const { data } = useQuery<any[]>({
    queryKey: [config.listUrl],
    queryFn: () => api.get(config.listUrl),
  });

  const [form, setForm] = React.useState<Record<string, any>>({});

  const create = useMutation({
    mutationFn: () => api.post(config.createUrl, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.listUrl] });
      setForm({});
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(config.deleteUrl(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [config.listUrl] }),
  });

  const idKey = config.idKey || "id";

  return (
    <div style={{ padding: 24 }}>
      <h1>{config.title}</h1>

      <form onSubmit={(e)=>{e.preventDefault();create.mutate();}}
            style={{ display: "grid", gap: 8, maxWidth: 520, margin: "16px 0" }}>
        <strong>Crear</strong>
        {config.fields.map(f => (
          <input key={f.name}
                 placeholder={f.label}
                 required={!!f.required}
                 type={f.type || "text"}
                 value={form[f.name] || ""}
                 onChange={(e)=>setForm({ ...form, [f.name]: e.target.value })}
          />
        ))}
        <button type="submit" disabled={create.isPending}>Crear</button>
      </form>

      <ul>
        {data?.map((row) => (
          <li key={row[idKey]} style={{ margin: "8px 0" }}>
            {JSON.stringify(row)}{" "}
            <button onClick={() => remove.mutate(row[idKey])}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
