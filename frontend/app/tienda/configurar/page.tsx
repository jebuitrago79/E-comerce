//app/tienda/Configurar
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJSON, postJSON, putJSON } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient"; // 👈 el mismo que usas para productos

type Tienda = {
  id: number;
  vendedor_id: number;
  nombre_negocio: string;
  descripcion?: string | null;
  color_primario?: string | null;
  logo_url?: string | null;
  slug: string;
};

// 👇 función auxiliar para subir logo (igual que productos, pero en carpeta logos/)
async function uploadLogoImage(file: File, slug: string) {
  const ext = file.name.split(".").pop() || "png";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const path = `logos/${slug || "sin-slug"}/${fileName}`;

  // Usa el MISMO bucket que ya tienes funcionando (productos)
  const { data, error } = await supabase.storage
    .from("productos") // <- si luego quieres, lo cambias a "tiendas" y creas ese bucket
    .upload(path, file);

  if (error) {
    console.error("Error subiendo logo:", error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from("productos")
    .getPublicUrl(path);

  return publicData.publicUrl;
}

export default function ConfigurarTiendaPage() {
  const router = useRouter();

  const [idVendedor, setIdVendedor] = useState<number | null>(null);
  const [tienda, setTienda] = useState<Tienda | null>(null);

  const [nombreNegocio, setNombreNegocio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [colorPrimario, setColorPrimario] = useState("#4f46e5");
  const [logoUrl, setLogoUrl] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false); // 👈 nuevo
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1) Traer id_vendedor desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("id_vendedor");
    if (!stored) {
      setError(
        "No se encontró el ID del vendedor. Inicie sesión nuevamente como vendedor."
      );
      setLoading(false);
      return;
    }
    const id = Number(stored);
    if (Number.isNaN(id)) {
      setError("El ID de vendedor guardado no es válido.");
      setLoading(false);
      return;
    }
    setIdVendedor(id);
  }, []);

  // 2) Cargar tienda actual (si existe)
  useEffect(() => {
    if (!idVendedor) return;

    const fetchTienda = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getJSON<Tienda>(`/tiendas/vendedor/${idVendedor}`);

        setTienda(data);
        setNombreNegocio(data.nombre_negocio ?? "");
        setDescripcion(data.descripcion ?? "");
        setColorPrimario(data.color_primario ?? "#4f46e5");
        setLogoUrl(data.logo_url ?? "");
        setSlug(data.slug ?? "");
      } catch (err: any) {
        // Si es 404, aún no tiene tienda → modo "crear"
        if (err?.status === 404) {
          setTienda(null);
        } else {
          console.error(err);
          setError("No se pudo cargar la tienda del vendedor.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTienda();
  }, [idVendedor]);

  // 👇 2.5) Subir logo a Supabase y guardar URL en el estado
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!slug) {
      alert(
        "Primero escriba el slug de su tienda (abajo) para poder generar la ruta del logo."
      );
      e.target.value = "";
      return;
    }

    try {
      setSubiendoLogo(true);
      setError(null);
      setSuccess(null);

      const publicUrl = await uploadLogoImage(file, slug);
      setLogoUrl(publicUrl);
      setSuccess("Logo subido correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudo subir el logo. Intente nuevamente.");
    } finally {
      setSubiendoLogo(false);
    }
  };

  // 3) Guardar (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idVendedor) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let data: Tienda;

      if (!tienda) {
        // Crear
        data = await postJSON<Tienda>("/tiendas", {
          id_vendedor: idVendedor,
          nombre_negocio: nombreNegocio,
          descripcion,
          color_primario: colorPrimario,
          logo_url: logoUrl || null,
          slug,
        });
        setSuccess("Tienda creada correctamente.");
      } else {
        // Actualizar
        data = await putJSON<Tienda>(`/tiendas/vendedor/${idVendedor}`, {
          nombre_negocio: nombreNegocio,
          descripcion,
          color_primario: colorPrimario,
          logo_url: logoUrl || null,
          slug,
        });
        setSuccess("Tienda actualizada correctamente.");
      }

      setTienda(data);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.detail ||
        err?.message ||
        "Ocurrió un error al guardar la tienda. Intente nuevamente.";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Cargando configuración de tienda...
        </p>
      </main>
    );
  }

  if (error && !idVendedor) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 max-w-md text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push("/vendedores/login")}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  // 🔹 URL pública a mostrar (usa primero la de la tienda, si no el slug del formulario)
  const slugPublico = tienda?.slug || slug;

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Configuración de mi tienda
          </h1>
          <p className="text-sm text-gray-600">
            Defina el nombre del negocio, los colores, el logo y la URL
            pública de su tienda. Más adelante esto se reflejará en la
            página construida con Plasmic.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* 🔹 Bloque nuevo: URL pública + botón Ver tienda */}
        {slugPublico && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <div className="text-slate-700">
              URL pública de su tienda:{" "}
              <span className="font-mono text-slate-900">
                /tienda/{slugPublico}
              </span>
            </div>
            {tienda?.slug && (
              <a
                href={`/tienda/${tienda.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Ver tienda pública
              </a>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del negocio
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Tienda Don Pepe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Cuente brevemente qué ofrece su tienda..."
            />
          </div>

          {/* Color + Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="#4f46e5"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo de la tienda (opcional)
              </label>

              <div className="space-y-2">
                {/* input de archivo */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-3
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />

                {subiendoLogo && (
                  <p className="text-xs text-gray-500">
                    Subiendo logo...
                  </p>
                )}

                {/* campo de URL, igual que en productos */}
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://... (se llena automáticamente al subir un logo)"
                />

                {/* vista previa */}
                {logoUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Vista previa:
                    </p>
                    <img
                      src={logoUrl}
                      alt="Logo de la tienda"
                      className="h-16 object-contain rounded-md border border-gray-200 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug público (URL de la tienda)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                https://mi-dominio.com/tienda/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9\-]/g, "")
                  )
                }
                required
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="mi-tienda-super"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Solo letras, números y guiones. Debe ser único en la
              plataforma.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving
                ? "Guardando..."
                : tienda
                ? "Actualizar tienda"
                : "Crear tienda"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
