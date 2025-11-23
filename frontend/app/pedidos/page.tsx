"use client";

import { useEffect, useState } from "react";
import { getJSON, putJSON } from "@/lib/api";

type Pedido = {
  id: number;
  // 👇 si quieres verlo en el front
  comprador_id?: number;
  nombre_cliente: string;
  email_cliente: string;
  direccion: string;
  telefono?: string | null;
  metodo_pago: "tarjeta" | "contra_entrega";
  total: number;
  estado: string; // "pendiente_entrega" | "entregado" | ...
};

type CompradorActual = {
  id: number;
  id_comprador: number; // ID manual
  nombre: string;
  email: string;
};

type VendedorActual = {
  id: number;
  id_vendedor: number;
  nombre: string;
  email: string;
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [comprador, setComprador] = useState<CompradorActual | null>(null);
  const [vendedor, setVendedor] = useState<VendedorActual | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  let compradorId: number | null = null;
  let hayRol = false;

  if (typeof window !== "undefined") {
    const c = window.localStorage.getItem("compradorActual");
    const v = window.localStorage.getItem("vendedorActual");

    if (c) {
      try {
        const parsed: CompradorActual = JSON.parse(c);
        setComprador(parsed);

        const idManual = Number(parsed.id_comprador);
        if (!Number.isNaN(idManual)) {
          compradorId = idManual;
          hayRol = true;
        }
      } catch {}
    }

    if (v) {
      try {
        const parsed: VendedorActual = JSON.parse(v);
        setVendedor(parsed);
        hayRol = true;
      } catch {}
    }
  }

  // ⛔ Si NO hay comprador NI vendedor → NO cargamos nada
  if (!hayRol) {
    setLoading(false);
    return;
  }

  // ✔ Si hay algún rol → cargamos pedidos
  const load = async () => {
    try {
      setError(null);

      let url = "/pedidos";
      if (compradorId) url += `?comprador_id=${compradorId}`;

      const data = await getJSON<Pedido[]>(url);
      setPedidos(data);
    } catch (err: any) {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  const marcarEntregado = async (id: number) => {
    try {
      setError(null);
      const actualizado = await putJSON<Pedido>(`/pedidos/${id}`, {
        estado: "entregado",
      });

      setPedidos((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ?? "No se pudo actualizar el pedido."
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando pedidos…</p>
      </main>
    );
  }

  // Ahora `pedidos` YA VIENE filtrado por comprador_id si hay comprador.
  const pedidosComprador = pedidos;
  const pedidosVendedor = pedidos; // más adelante lo filtramos por vendedor cuando tengas esa relación

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-gray-600">
            Aquí se muestran los pedidos según tu rol.
          </p>
        </header>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* BLOQUE COMPRADOR – SOLO SI HAY compradorActual */}
        {comprador && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="text-lg font-semibold">Mis pedidos como comprador</h2>
            {pedidosComprador.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no tienes pedidos registrados.
              </p>
            ) : (
              <ul className="space-y-3">
                {pedidosComprador.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        Pedido #{p.id} · ${p.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        Estado: {p.estado}
                      </p>
                    </div>
                    {p.estado !== "entregado" && (
                      <button
                        onClick={() => marcarEntregado(p.id)}
                        className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Marcar como entregado
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* BLOQUE VENDEDOR – SOLO SI HAY vendedorActual (por ahora ve lo mismo que el comprador) */}
        {vendedor && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              Pedidos de mis productos (vendedor)
            </h2>
            <p className="text-xs text-gray-500">
              Solo lectura. Aquí ves qué pedidos siguen pendientes y cuáles
              fueron marcados como entregados por el comprador.
            </p>

            {pedidosVendedor.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay pedidos asociados a tus productos.
              </p>
            ) : (
              <ul className="space-y-3">
                {pedidosVendedor.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        Pedido #{p.id} · ${p.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cliente: {p.nombre_cliente} ({p.email_cliente})
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                      {p.estado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {!comprador && !vendedor && (
          <p className="text-sm text-gray-500">
            Inicia sesión como comprador o vendedor para ver pedidos.
          </p>
        )}
      </div>
    </main>
  );
}
