"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { errorToText } from "@/lib/httpError";

const TENANT = process.env.NEXT_PUBLIC_TENANT_ID as string;

type Vendedor = {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  direccion: string | null;
  estado_cuenta: "activo" | "bloqueado";
};

export default function VendedoresPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = React.useState<string | null>(null);

  const [f, setF] = React.useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    empresa: "",
    direccion: "",
    estado_cuenta: "activo" as "activo" | "bloqueado",
  });

  // LISTAR
  const vendedores = useQuery({
    queryKey: ["vendedores", TENANT],
    queryFn: async () =>
      (await api.get<Vendedor[]>(`/tenants/${TENANT}/vendedores?limit=200&offset=0`))
        .data,
  });

  // CREAR
  const crear = useMutation({
    mutationFn: async () => {
      setMsg(null);
      if (!f.nombre.trim() || !f.email.trim() || !f.password.trim()) {
        throw new Error("Nombre, email y contraseña son obligatorios.");
      }
      const payload = {
        nombre: f.nombre.trim(),
        email: f.email.trim(),
        password: f.password, // requerido por la BD
        telefono: f.telefono?.trim() || null,
        empresa: f.empresa?.trim() || null,
        direccion: f.direccion?.trim() || null,
        estado_cuenta: f.estado_cuenta,
      };
      const { data } = await api.post(`/tenants/${TENANT}/vendedores`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendedores", TENANT] });
      setF({
        nombre: "",
        email: "",
        password: "",
        telefono: "",
        empresa: "",
        direccion: "",
        estado_cuenta: "activo",
      });
      setMsg("✅ Vendedor creado.");
    },
    onError: (err: any) => setMsg(`❌ ${errorToText(err)}`),
  });

  // ELIMINAR
  const eliminar = useMutation({
    mutationFn: async (id: number) =>
      (await api.delete(`/tenants/${TENANT}/vendedores/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendedores", TENANT] }),
    onError: (err: any) => setMsg(`❌ ${errorToText(err)}`),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Vendedores</h1>

      <div className="bg-white/5 p-4 rounded-lg flex flex-wrap gap-2">
        <input
          placeholder="Nombre"
          value={f.nombre}
          onChange={(e) => setF({ ...f, nombre: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <input
          placeholder="Email"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <input
          placeholder="Teléfono"
          value={f.telefono}
          onChange={(e) => setF({ ...f, telefono: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <input
          placeholder="Empresa"
          value={f.empresa}
          onChange={(e) => setF({ ...f, empresa: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <input
          placeholder="Dirección"
          value={f.direccion}
          onChange={(e) => setF({ ...f, direccion: e.target.value })}
          className="px-3 py-2 rounded bg-white/10"
        />
        <select
          value={f.estado_cuenta}
          onChange={(e) =>
            setF({ ...f, estado_cuenta: e.target.value as "activo" | "bloqueado" })
          }
          className="px-3 py-2 rounded bg-white/10"
        >
          <option value="activo">activo</option>
          <option value="bloqueado">bloqueado</option>
        </select>

        <button
          onClick={() => crear.mutate()}
          disabled={crear.isPending}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          {crear.isPending ? "Creando..." : "Crear"}
        </button>

        {msg && <p className="w-full mt-2">{msg}</p>}
        {vendedores.isError && (
          <p className="w-full mt-2 text-red-400">❌ {errorToText(vendedores.error)}</p>
        )}
      </div>

      <div className="overflow-x-auto bg-white/5 rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Teléfono</th>
              <th className="text-left p-2">Empresa</th>
              <th className="text-left p-2">Dirección</th>
              <th className="text-left p-2">Estado</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {vendedores.data?.map((v) => (
              <tr key={v.id} className="border-t border-white/10">
                <td className="p-2">{v.id}</td>
                <td className="p-2">{v.nombre}</td>
                <td className="p-2">{v.email}</td>
                <td className="p-2">{v.telefono}</td>
                <td className="p-2">{v.empresa}</td>
                <td className="p-2">{v.direccion}</td>
                <td className="p-2">{v.estado_cuenta}</td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:text-red-400"
                    onClick={() => eliminar.mutate(v.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {vendedores.isLoading && (
              <tr>
                <td className="p-4" colSpan={8}>
                  Cargando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
