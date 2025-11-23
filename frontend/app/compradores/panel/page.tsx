// app/compradores/panel/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompradorActual = {
  id: number;
  nombre: string;
  email: string;
};

export default function CompradorPanelPage() {
  const router = useRouter();
  const [comprador, setComprador] = useState<CompradorActual | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("compradorActual");
    if (!raw) {
      router.push("/compradores/login");
      return;
    }
    try {
      setComprador(JSON.parse(raw));
    } catch {
      router.push("/compradores/login");
    }
  }, [router]);

  const handleLogout = () => {
    window.localStorage.removeItem("compradorActual");
    router.push("/"); // pantalla inicial
  };

  if (!comprador) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando panel…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Panel del comprador</h1>
            <p className="text-sm text-gray-600">
              Bienvenido, {comprador.nombre}
            </p>
            <p className="text-xs text-gray-500">{comprador.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </header>

        {/* 🔹 Tarjetas del panel */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Explorar tiendas */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-2">Explorar tiendas</h2>
            <p className="text-sm text-gray-600 mb-4">
              Vea todas las tiendas disponibles en la plataforma y explore sus
              productos destacados.
            </p>
            <Link
              href="/tiendas"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Ver todas las tiendas
            </Link>
          </article>

          {/* 🔥 Nueva tarjeta: Mis pedidos */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-2">Mis pedidos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Revise el estado de sus compras, vea qué pedidos están en camino y
              marque como recibidos los que ya llegaron.
            </p>
            <Link
              href="/pedidos"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Ver mis pedidos
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
