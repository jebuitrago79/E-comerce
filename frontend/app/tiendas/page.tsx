// app/tiendas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";
import Link from "next/link";

type Tienda = {
  id: number;
  nombre_negocio: string;
  descripcion?: string | null;
  color_primario?: string | null;
  logo_url?: string | null;
  slug: string;
};

export default function TiendasListadoPage() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getJSON<Tienda[]>("/tiendas/");
        setTiendas(data);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.message || "No se pudieron cargar las tiendas disponibles.";
        setError(String(msg));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando tiendas…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 max-w-md text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Tiendas disponibles
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Explore las tiendas creadas por los vendedores y descubra sus
            productos destacados.
          </p>
        </header>

        {tiendas.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay tiendas disponibles en este momento.
          </p>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiendas.map((t) => {
              const logo =
                t.logo_url && t.logo_url.trim() !== ""
                  ? t.logo_url
                  : "https://via.placeholder.com/80x80?text=Logo";

              return (
                <article
                  key={t.id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={logo}
                        alt={t.nombre_negocio}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        {t.nombre_negocio}
                      </h2>
                      <p className="text-xs text-gray-500">
                        /tienda/{t.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 px-4 py-3">
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {t.descripcion || "Tienda sin descripción todavía."}
                    </p>
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100">
                    <Link
                      href={`/tienda/${t.slug}`}
                      className="inline-flex w-full justify-center items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition"
                    >
                      Ver tienda
                    </Link>
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
