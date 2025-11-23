// app/vendedores/panel/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PanelVendedorPage() {
  const [idVendedor, setIdVendedor] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const raw = localStorage.getItem("vendedorActual");

      if (!raw) {
        console.warn("No hay vendedorActual en localStorage, redirigiendo…");
        router.push("/vendedores/login");
        return;
      }

      const vendedor = JSON.parse(raw);
      const id = Number(vendedor?.id_vendedor);

      if (!isNaN(id)) {
        setIdVendedor(id);
      } else {
        console.error("id_vendedor inválido en vendedorActual", vendedor);
        setIdVendedor(null);
      }
    } catch (e) {
      console.error("Error leyendo vendedorActual desde localStorage", e);
      setIdVendedor(null);
    }
  }, [router]);

  const cerrarSesion = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vendedorActual");
      localStorage.removeItem("id_vendedor");
    }
    router.push("/vendedores/login");
  };

  // Mientras cargamos el id del vendedor
  if (idVendedor === null) {
    return (
      <main className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Cargando datos del vendedor…</p>
        </div>
      </main>
    );
  }

  const productosHref = `/vendedores/${idVendedor}/productos`;

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado con botón de cerrar sesión */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel del Vendedor
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              Desde aquí puede configurar su tienda, crear categorías y
              administrar sus productos. Todo lo que haga se verá reflejado
              en su tienda pública.
            </p>
          </div>

          <button
            onClick={cerrarSesion}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mi tienda */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Mi tienda
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Defina el nombre del negocio, los colores, el logo y la URL
              pública (slug) de su tienda.
            </p>
            <Link
              href="/tienda/configurar"
              className="inline-flex w-full justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Configurar / editar tienda
            </Link>
          </div>

          {/* Mis productos */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Mis productos
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Cree, edite y elimine los productos que se mostrarán en su tienda.
            </p>
            <Link
              href={productosHref}
              className="inline-flex w-full justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Gestionar productos
            </Link>
          </div>

          {/* Categorías */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Categorías
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Organice sus productos en categorías para que los clientes
              encuentren todo más fácil.
            </p>
            <Link
              href="/categorias"
              className="inline-flex w-full justify-center items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Gestionar categorías
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
