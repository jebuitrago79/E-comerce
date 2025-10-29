"use client";

import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  categoria_id: number;
  vendedor_id: number;
};

export default function ProductosPage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["productos"],
    queryFn: () => api.get<Producto[]>("/productos/"),
  });

  const [form, setForm] = useState({
    nombre: "",
    precio: 0,
    categoria_id: 0,
    vendedor_id: 0,
  });

  const createMut = useMutation({
    mutationFn: () => api.post<Producto>("/productos/", form),
    onSuccess: () => {
      setForm({ nombre: "", precio: 0, categoria_id: 0, vendedor_id: 0 });
      qc.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: number) => api.del(`/productos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Productos</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.nombre || !form.precio || !form.categoria_id || !form.vendedor_id) {
            alert("Todos los campos son obligatorios.");
            return;
          }
          createMut.mutate();
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow"
      >
        <label className="flex flex-col text-sm">
          Nombre
          <input className="input" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </label>
        <label className="flex flex-col text-sm">
          Precio
          <input type="number" className="input" value={form.precio}
            onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col text-sm">
          Categoría ID
          <input type="number" className="input" value={form.categoria_id}
            onChange={(e) => setForm({ ...form, categoria_id: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col text-sm">
          Vendedor ID
          <input type="number" className="input" value={form.vendedor_id}
            onChange={(e) => setForm({ ...form, vendedor_id: Number(e.target.value) })} />
        </label>
        <div className="md:col-span-4">
          <button className="btn-primary" disabled={createMut.isPending}>
            {createMut.isPending ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">Nombre</th>
              <th className="th">Precio</th>
              <th className="th">Cat</th>
              <th className="th">Vend</th>
              <th className="th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="td">{p.id}</td>
                <td className="td">{p.nombre}</td>
                <td className="td">${p.precio}</td>
                <td className="td">{p.categoria_id}</td>
                <td className="td">{p.vendedor_id}</td>
                <td className="td">
                  <button className="btn-danger" onClick={() => delMut.mutate(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
