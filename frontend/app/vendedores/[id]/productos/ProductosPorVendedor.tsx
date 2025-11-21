//app/vendedores/id/productos
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJSON, postJSON, putJSON, del } from "@/lib/api";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabaseClient";   // 👈 IMPORTANTE

// Tipos locales
type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  category_id?: number | null;
  vendedor_id: number;
  imagen_url?: string | null;
  destacado: boolean;               
};

type Categoria = {
  id: number;
  nombre: string;
};

type ProductoForm = {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number | "";
  stock: number | "";
  category_id: number | "";
  imagen_url?: string | null;
  destacado: boolean;               // 👈 NUEVO
};

export default function ProductosPorVendedor({
  vendedorId,
}: {
  vendedorId: number;
}) {
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductoForm>({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    category_id: "",
    imagen_url: undefined,
    destacado: false,
  });

  const [file, setFile] = useState<File | null>(null);   // 👈 archivo seleccionado

  // ========== 🔵 CONSULTA: productos del vendedor ==========
  const {
    data: productos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["productos", "vendedor", vendedorId],
    queryFn: () => getJSON<Producto[]>(`/vendedores/${vendedorId}/productos`),
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => getJSON<Categoria[]>("/categorias/"),
  });

  const pageItems = useMemo(() => {
    if (!productos) return [];
    const start = (page - 1) * pageSize;
    return productos.slice(start, start + pageSize);
  }, [productos, page]);

  // ========== 🟢 CREAR ==========
  const crearProducto = useMutation({
    mutationFn: (payload: any) => postJSON("/productos/", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "vendedor", vendedorId] });
      closeModal();
    },
  });

  // ========== 🟡 EDITAR ==========
  const actualizarProducto = useMutation({
    mutationFn: (payload: { id: number; data: any }) =>
      putJSON(`/productos/${payload.id}`, payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "vendedor", vendedorId] });
      closeModal();
    },
  });

  // ========== 🔴 ELIMINAR ==========
  const eliminarProducto = useMutation({
    mutationFn: (id: number) => del(`/productos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos", "vendedor", vendedorId] });
    },
  });

  // ========== MODALES ==========
  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      category_id: "",
      imagen_url: undefined,
      destacado: false,
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Producto) => {
    setEditingId(p.id);
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: p.precio,
      stock: p.stock,
      category_id: p.category_id ?? "",
      imagen_url: p.imagen_url ?? undefined, 
      destacado: p.destacado, // 👈 guardamos URL actual
    });
    setFile(null);                              // 👈 si sube otro archivo, sustituye
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (["precio", "stock", "category_id"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 👇 AHORA ES ASYNC POR LA SUBIDA A SUPABASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) Validaciones básicas
    const precioNum = form.precio === "" ? 0 : Number(form.precio);
    const stockNum = form.stock === "" ? 0 : Number(form.stock);
    const categoriaNum =
      form.category_id === "" ? undefined : Number(form.category_id);

    // 2) Subir imagen a Supabase (si escogieron archivo)
    let imagen_url = form.imagen_url ?? null;

    if (file) {
      try {
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
          alert("Error al subir la imagen");
          return;
        }

        const { data: publicData } = supabase.storage
          .from("productos")
          .getPublicUrl(uploadData.path);

        imagen_url = publicData.publicUrl;
      } catch (err) {
        console.error(err);
        alert("Error inesperado al subir la imagen");
        return;
      }
    }

    // 3) Payload para backend (igual que /productos, pero con vendedor fijo)
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: precioNum,
      stock: stockNum,
      category_id: categoriaNum,
      id_vendedor: vendedorId,  // 👈 ID MANUAL DEL VENDEDOR (de la URL)
      imagen_url,
      destacado: form.destacado,                // 👈 URL final (nueva o existente)
    };
    console.log("PAYLOAD PRODUCTO:", payload);

    if (editingId) {
      actualizarProducto.mutate({ id: editingId, data: payload });
    } else {
      crearProducto.mutate(payload);
    }
  };

  // ==========================================================
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Productos del vendedor #{vendedorId}
        </h1>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Nuevo producto
        </button>
      </div>

      {isLoading && <p>Cargando productos...</p>}
      {isError && (
        <p className="text-red-600">Error al cargar productos de este vendedor.</p>
      )}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto border rounded-lg bg-white">
            <table className="min-w-full text-sm">
<thead className="bg-slate-50">
  <tr>
    <th className="px-4 py-2 text-left">ID</th>
    <th className="px-4 py-2 text-left">Img</th>
    <th className="px-4 py-2 text-left">Nombre</th>
    <th className="px-4 py-2 text-left">Precio</th>
    <th className="px-4 py-2 text-left">Stock</th>
    <th className="px-4 py-2 text-left">Categoría</th>
    <th className="px-4 py-2 text-right">Acciones</th>
  </tr>
</thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">${p.precio}</td>
                    <td className="px-4 py-2">{p.stock}</td>
                    <td className="px-4 py-2">{p.category_id ?? "-"}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1 bg-slate-700 text-white text-xs rounded-md"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarProducto.mutate(p.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {productos?.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-4 text-slate-400"
                    >
                      Este vendedor no tiene productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {productos && productos.length > pageSize && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={productos.length}
                onPage={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* MODAL: mismo formulario que /productos, pero en modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar producto" : "Nuevo producto"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Precio</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Categoría</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Sin categoría</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
  <input
    type="checkbox"
    name="destacado"
    checked={form.destacado}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        destacado: e.target.checked,     // 👈 boolean
      }))
    }
    className="h-4 w-4"
  />
  <label className="text-sm">Producto destacado</label>
</div>

          <div>
            <label className="block text-sm">Imagen del producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
              }}
              className="w-full border rounded-md px-3 py-2"
            />
            {form.imagen_url && (
              <div className="mt-2 flex items-center space-x-3">
                <span className="text-xs text-slate-500">
                  Imagen actual:
                </span>
                <img
                  src={form.imagen_url}
                  alt={form.nombre}
                  className="h-10 w-10 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border rounded-md"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              {editingId ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
