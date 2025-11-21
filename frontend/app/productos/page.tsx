"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON } from "@/lib/api";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  category_id: number | null;
  vendedor_id: number | null;
  tenant_id?: number | null;
  imagen_url?: string | null;
};

type VendedorMin = {
  id_vendedor: number;
  nombre: string;
  email: string;
};

type Categoria = {
  id: number;
  nombre: string;
};

export default function ProductosPage() {
  const qc = useQueryClient();

  // 1) Productos
  const { data, isLoading, isError } = useQuery({
    queryKey: ["productos"],
    queryFn: () => getJSON<Producto[]>("/productos/"),
    staleTime: 1000,
  });

  // 2) Vendedores para el dropdown
  const vendQ = useQuery({
    queryKey: ["vendedores-min"],
    queryFn: () => getJSON<VendedorMin[]>("/vendedores/?limit=200&offset=0"),
    staleTime: 5_000,
  });

  // 3) Categorías para el dropdown
  const catQ = useQuery({
    queryKey: ["categorias"],
    queryFn: () => getJSON<Categoria[]>("/categorias/?limit=200&offset=0"),
    staleTime: 60_000,
  });

  // Form controlado
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "0",
    category_id: "",   // ahora será el id de la categoría elegida
    vendedor_id: "",  // id_vendedor manual
  });

  const [file, setFile] = useState<File | null>(null);
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
      });
      setFile(null);
      qc.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const precio = Number(form.precio);
    const stock = Number(form.stock);
    const category_id = form.category_id ? Number(form.category_id) : null;
    const vendedor_id =
      form.vendedor_id === "" ? null : Number(form.vendedor_id);

    // VALIDACIONES
    if (!form.nombre) return setMsg("❌ El nombre es obligatorio.");
    if (!Number.isFinite(precio) || precio < 0)
      return setMsg("❌ Precio inválido.");
    if (!Number.isInteger(stock) || stock < 0)
      return setMsg("❌ Stock inválido.");
    if (category_id === null)
      return setMsg("❌ Debe seleccionar una categoría.");

    if (vendedor_id !== null) {
      const exists = (vendQ.data ?? []).some(
        (v) => v.id_vendedor === vendedor_id
      );
      if (!exists) {
        return setMsg(
          `❌ vendedor_id ${vendedor_id} no existe. Elija uno de la lista o deje vacío.`
        );
      }
    }

    // 1) Subir imagen a Supabase (si hay archivo)
    let imagen_url: string | null = null;
    try {
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("productos") // bucket
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);
          return setMsg("❌ Error al subir la imagen.");
        }

        const { data: publicData } = supabase.storage
          .from("productos")
          .getPublicUrl(uploadData.path);

        imagen_url = publicData.publicUrl;
      }
    } catch (err: any) {
      console.error(err);
      return setMsg("❌ Error inesperado al subir la imagen.");
    }

    // 2) Enviar producto al backend (sin tenant_id, que usa default=1)
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio,
      stock,
      category_id,
      id_vendedor: vendedor_id, // tu backend espera id_vendedor manual
      imagen_url,
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
            onChange={(e) =>
              setForm({ ...form, descripcion: e.target.value })
            }
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

        {/* CATEGORÍA: ahora es un select con las categorías creadas */}
        <label className="flex flex-col text-sm">
          Categoría
          <select
            className="input"
            value={form.category_id}
            onChange={(e) =>
              setForm({ ...form, category_id: e.target.value })
            }
            disabled={catQ.isLoading || catQ.isError}
          >
            <option value="">— Seleccione categoría —</option>
            {(catQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.nombre}
              </option>
            ))}
          </select>
        </label>

        {/* VENDEDOR: igual que antes */}
        <label className="flex flex-col text-sm">
          Vendedor (opcional)
          <select
            className="input"
            value={form.vendedor_id}
            onChange={(e) =>
              setForm({ ...form, vendedor_id: e.target.value })
            }
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

        {/* INPUT DE IMAGEN */}
        <label className="flex flex-col text-sm md:col-span-2">
          Imagen del producto
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
            }}
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
              <th className="th">Img</th>
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
                <td className="td py-6 text-center" colSpan={8}>
                  Cargando…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="td py-6 text-center" colSpan={8}>
                  Error al cargar.
                </td>
              </tr>
            )}
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="td">{p.id}</td>
                <td className="td">
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="td">{p.nombre}</td>
                <td className="td">${p.precio}</td>
                <td className="td">{p.stock}</td>
                <td className="td">{p.category_id ?? "-"}</td>
                <td className="td">{p.vendedor_id ?? "-"}</td>
                <td className="td">
                  <button
                    className="btn-danger"
                    onClick={() => delMut.mutate(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && (data?.length ?? 0) === 0 && (
              <tr>
                <td className="td py-6 text-center" colSpan={8}>
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
