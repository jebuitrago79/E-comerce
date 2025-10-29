"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON } from "@/lib/api";
import { useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  category_id: number | null;
  vendedor_id: number | null;
  tenant_id?: number | null;
};

type VendedorMin = {
  id_vendedor: number;
  nombre: string;
  email: string;
};

export default function ProductosPage() {
  const qc = useQueryClient();

  // Listado de productos
  const { data, isLoading, isError } = useQuery({
    queryKey: ["productos"],
    queryFn: () => getJSON<Producto[]>("/productos/"),
    staleTime: 1000,
  });

  // Listado de vendedores para el dropdown (solo id y nombre)
  const vendQ = useQuery({
    queryKey: ["vendedores-min"],
    queryFn: () => getJSON<VendedorMin[]>("/vendedores/?limit=200&offset=0"),
    staleTime: 5_000,
  });

  // Form controlado
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "0",
    category_id: "",
    vendedor_id: "", // ← opcional, si vacío mandamos null
    tenant_id: "1",
  });

  const [msg, setMsg] = useState<string | null>(null);

  // Crear producto
  const createMut = useMutation({
    mutationFn: (payload: any) => postJSON<Producto>("/productos/", payload),
    onSuccess: () => {
      setMsg("✅ Producto creado");
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "0",
        category_id: "",
        vendedor_id: "",
        tenant_id: "1",
      });
      qc.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

const handleCreate = (e: React.FormEvent) => {
  e.preventDefault();
  setMsg(null);

  const precio = Number(form.precio);
  const stock = Number(form.stock);
  const category_id = form.category_id ? Number(form.category_id) : null;

  // vendedor_id: "" -> null; si tiene valor, lo validamos contra el listado
  const vendedor_id =
    form.vendedor_id === ""
      ? null
      : Number(form.vendedor_id);

  const tenant_id = form.tenant_id ? Number(form.tenant_id) : undefined;

  if (!form.nombre) return setMsg("❌ El nombre es obligatorio.");
  if (!Number.isFinite(precio) || precio < 0) return setMsg("❌ Precio inválido.");
  if (!Number.isInteger(stock) || stock < 0) return setMsg("❌ Stock inválido.");
  if (category_id === null) return setMsg("❌ category_id es obligatorio.");

  // ✅ Validar que el vendedor exista en el dropdown si lo eligieron
  if (vendedor_id !== null) {
    const exists = (vendQ.data ?? []).some(v => v.id_vendedor === vendedor_id);
    if (!exists) return setMsg(`❌ vendedor_id ${vendedor_id} no existe. Elija uno de la lista o deje vacío.`);
  }

  const payload = {
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    precio,
    stock,
    category_id,
    vendedor_id, // null si no eligió
    tenant_id,   // opcional
  };

  createMut.mutate(payload);
};

  // Eliminar
  const delMut = useMutation({
    mutationFn: (id: number) => del(`/productos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Productos</h1>

      {/* Form crear */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow"
      >
        <label className="flex flex-col text-sm">
          Nombre
          <input
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </label>

        <label className="flex flex-col text-sm md:col-span-2">
          Descripción (opcional)
          <input
            className="input"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </label>

        <label className="flex flex-col text-sm">
          Precio
          <input
            type="number"
            className="input"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </label>

        <label className="flex flex-col text-sm">
          Stock
          <input
            type="number"
            className="input"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </label>

        <label className="flex flex-col text-sm">
          Categoría ID
          <input
            type="number"
            className="input"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          />
        </label>

        <label className="flex flex-col text-sm">
          Vendedor (opcional)
          <select
            className="input"
            value={form.vendedor_id}
            onChange={(e) => setForm({ ...form, vendedor_id: e.target.value })}
            disabled={vendQ.isLoading || vendQ.isError}
          >
            <option value="">— Sin vendedor —</option>
            {(vendQ.data ?? []).map((v) => (
              <option key={v.id_vendedor} value={v.id_vendedor}>
                {v.id_vendedor} · {v.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          Tenant ID (opcional)
          <input
            type="number"
            className="input"
            value={form.tenant_id}
            onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
          />
        </label>

        <div className="md:col-span-4">
          <button className="btn-primary" disabled={createMut.isPending}>
            {createMut.isPending ? "Creando..." : "Crear"}
          </button>
          {msg && <span className="ml-3 text-sm">{msg}</span>}
        </div>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">Nombre</th>
              <th className="th">Precio</th>
              <th className="th">Stock</th>
              <th className="th">Cat</th>
              <th className="th">Vend</th>
              <th className="th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="td py-6 text-center" colSpan={7}>
                  Cargando…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="td py-6 text-center" colSpan={7}>
                  Error al cargar.
                </td>
              </tr>
            )}
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="td">{p.id}</td>
                <td className="td">{p.nombre}</td>
                <td className="td">${p.precio}</td>
                <td className="td">{p.stock}</td>
                <td className="td">{p.category_id ?? "-"}</td>
                <td className="td">{p.vendedor_id ?? "-"}</td>
                <td className="td">
                  <button className="btn-danger" onClick={() => delMut.mutate(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && (data?.length ?? 0) === 0 && (
              <tr>
                <td className="td py-6 text-center" colSpan={7}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
