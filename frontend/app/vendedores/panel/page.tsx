"use client";

import Link from "next/link";

export default function PanelVendedorPage() {
  // Más adelante aquí podemos leer el id_vendedor desde localStorage o contexto
  // para filtrar productos, etc.
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel del Vendedor
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Desde aquí puede configurar su tienda, crear categorías y administrar
            sus productos. Todo lo que haga se verá reflejado en su tienda pública.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Tienda */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Mi tienda
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Defina el nombre del negocio, los colores, el logo y la URL
              pública (slug) de su tienda.
            </p>
            <div className="space-y-2">
              <Link
                href="/tienda/configurar"
                className="inline-flex w-full justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Configurar / editar tienda
              </Link>
            </div>
          </div>

          {/* Tarjeta Productos */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Mis productos
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Cree, edite y elimine los productos que se mostrarán en su tienda.
              Más adelante filtraremos esta vista solo con sus productos.
            </p>
            <div className="space-y-2">
              <Link
                href="/productos"
                className="inline-flex w-full justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Gestionar productos
              </Link>
            </div>
          </div>

          {/* Tarjeta Categorías */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Categorías
            </h2>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              Organice sus productos en categorías para que los clientes
              encuentren todo más fácil.
            </p>
            <div className="space-y-2">
              <Link
                href="/categorias"
                className="inline-flex w-full justify-center items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                Gestionar categorías
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
