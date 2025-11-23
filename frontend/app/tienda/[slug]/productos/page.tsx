// app/tienda/[slug]/productos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJSON } from "@/lib/api";
import { useCart } from "@/app/context/CartContext";

type Tienda = {
  id: number;
  vendedor_id: number;
  vendedor_id_manual: string | number;
  nombre_negocio: string;
  descripcion: string | null;
  color_primario: string | null;
  logo_url: string | null;
  slug: string;
};

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen_url?: string | null;
  destacado: boolean;
  vendedor_id: number;
};

const TIENDA_BY_SLUG_URL = (slug: string) => `/tiendas/${slug}`;

export default function CatalogoTiendaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();

  const { addItem } = useCart();

  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const safeSlug = String(slug);

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) Datos de la tienda
        const tiendaJson = await getJSON<Tienda>(
          TIENDA_BY_SLUG_URL(encodeURIComponent(safeSlug))
        );
        setTienda(tiendaJson);

        // 2) ¿Es el vendedor dueño de la tienda?
        if (typeof window !== "undefined") {
          const rawVend = window.localStorage.getItem("vendedorActual");
          if (rawVend) {
            try {
              const vend = JSON.parse(rawVend);
              const idManualLocal = Number(vend?.id_vendedor);
              const idManualTienda = Number(tiendaJson.vendedor_id_manual);

              if (!isNaN(idManualLocal) && idManualLocal === idManualTienda) {
                // Es el dueño → ir al panel de productos (CRUD)
                router.push(`/vendedores/${idManualLocal}/productos`);
                return; // no seguimos cargando catálogo
              }
            } catch (e) {
              console.warn("No se pudo leer vendedorActual:", e);
            }
          }
        }

        // 3) Productos de la tienda para el catálogo de compra
        const productosJson = await getJSON<Producto[]>(
          `/tiendas/${encodeURIComponent(safeSlug)}/productos`
        );
        setProductos(productosJson);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message ?? "No se pudieron cargar los productos de la tienda."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, router]);

  // Estados de carga / error
  if (!slug) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando información de la tienda…</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando productos…</p>
      </main>
    );
  }

  if (error || !tienda) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-sm">
          {error ?? "No se pudo cargar la tienda."}
        </p>
      </main>
    );
  }

  // Vista de catálogo (comprador u otro usuario)
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header tienda */}
        <header className="flex items-center gap-4">
          {tienda.logo_url && (
            <img
              src={tienda.logo_url}
              alt={tienda.nombre_negocio}
              className="h-16 w-16 rounded-full object-cover border border-gray-200 bg-white"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tienda.nombre_negocio}
            </h1>
            {tienda.descripcion && (
              <p className="text-sm text-gray-600">{tienda.descripcion}</p>
            )}
          </div>
        </header>

        {/* Lista de productos SOLO lectura + botón agregar */}
        {productos.length === 0 ? (
          <p className="text-sm text-gray-500">
            Esta tienda aún no tiene productos publicados.
          </p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => {
              const img =
                p.imagen_url && p.imagen_url.trim() !== ""
                  ? p.imagen_url
                  : "https://via.placeholder.com/300x200?text=Producto";

              return (
                <article
                  key={p.id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="h-40 w-full bg-gray-100">
                    <img
                      src={img}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 px-4 py-3 space-y-1">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {p.nombre}
                    </h2>
                    {p.descripcion && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {p.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-emerald-700">
                      ${p.precio}
                    </span>
                    <button
                      onClick={() =>
                        addItem({
                          id: p.id,
                          nombre: p.nombre,
                          precio: p.precio,
                          imagen_url: p.imagen_url ?? undefined,
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
