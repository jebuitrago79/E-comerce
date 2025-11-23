// app/administradores/panel/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJSON, putJSON, del } from "@/lib/api";

type AdminActual = {
  id: number;
  nombre: string;
  email: string;
  nivel_acceso?: number;
};

type EstadoCuenta = "activo" | "bloqueado" | string;

type Vendedor = {
  id: number; // id de la tabla
  id_vendedor?: number; // id manual
  nombre: string;
  email: string;
  estado_cuenta?: EstadoCuenta;
};

type Comprador = {
  id: number;
  id_comprador?: number; // id manual
  nombre: string;
  email: string;
  estado_cuenta?: EstadoCuenta;
};

type Pedido = {
  id: number;
  nombre_cliente: string;
  email_cliente: string;
  total: number;
  estado: string;
};

export default function AdminPanelPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminActual | null>(null);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leer adminActual y cargar datos
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("adminActual");
    if (!raw) {
      router.push("/administradores/login");
      return;
    }

    try {
      const parsed: AdminActual = JSON.parse(raw);
      setAdmin(parsed);
    } catch {
      window.localStorage.removeItem("adminActual");
      router.push("/administradores/login");
      return;
    }

    const loadAll = async () => {
      try {
        setError(null);
        setLoading(true);

        const [vend, comp, ped] = await Promise.all([
          getJSON<Vendedor[]>("/vendedores/"),
          getJSON<Comprador[]>("/compradores/"),
          getJSON<Pedido[]>("/pedidos"),
        ]);

        setVendedores(vend);
        setCompradores(comp);
        setPedidos(ped);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.detail ??
            "No se pudieron cargar los datos del administrador."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [router]);

  // Cerrar sesión admin
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("adminActual");
    }
    router.push("/");
  };

  // ================= ACCIONES ADMIN =================

// 👇 cambiar estado de VENDEDOR por id_vendedor (manual)
const toggleEstadoVendedor = async (v: Vendedor) => {
  try {
    setError(null);
    const nuevoEstado = v.estado_cuenta === "activo" ? "bloqueado" : "activo";
    const idVisible = v.id_vendedor ?? v.id; // id manual

    const actualizado = await putJSON<Vendedor>(
      `/vendedores/${idVisible}/estado`,
      { estado_cuenta: nuevoEstado }
    );

    setVendedores((prev) =>
      prev.map((vend) =>
        vend.id === actualizado.id ? { ...vend, ...actualizado } : vend
      )
    );
  } catch (err: any) {
    console.error(err);
    setError(
      err?.response?.data?.detail ||
        "No se pudo cambiar el estado del vendedor."
    );
  }
};

// 👇 cambiar estado de COMPRADOR por id_comprador (manual)
const toggleEstadoComprador = async (c: Comprador) => {
  try {
    setError(null);
    const nuevoEstado = c.estado_cuenta === "activo" ? "bloqueado" : "activo";
    const idVisible = c.id_comprador ?? c.id;

    const actualizado = await putJSON<Comprador>(
      `/compradores/${idVisible}/estado`,
      { estado_cuenta: nuevoEstado }
    );

    setCompradores((prev) =>
      prev.map((comp) =>
        comp.id === actualizado.id ? { ...comp, ...actualizado } : comp
      )
    );
  } catch (err: any) {
    console.error(err);
    setError(
      err?.response?.data?.detail ||
        "No se pudo cambiar el estado del comprador."
    );
  }
};

const eliminarVendedor = async (v: Vendedor) => {
  if (
    !confirm(
      `¿Seguro que desea eliminar al vendedor "${v.nombre}"? Esta acción no se puede deshacer.`
    )
  ) {
    return;
  }
  try {
    const idVisible = v.id_vendedor ?? v.id;   // 👈 usar el manual si existe
    await del(`/vendedores/${idVisible}`);
    setVendedores((prev) => prev.filter((item) => item.id !== v.id));
  } catch (err: any) {
    console.error(err);
    setError(
      err?.response?.data?.detail ?? "No se pudo eliminar al vendedor."
    );
  }
};


  const eliminarComprador = async (c: Comprador) => {
    if (
      !confirm(
        `¿Seguro que desea eliminar al comprador "${c.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      await del(`/compradores/${c.id}`);
      setCompradores((prev) => prev.filter((item) => item.id !== c.id));
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ?? "No se pudo eliminar al comprador."
      );
    }
  };

  // ================= RENDER =================

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando panel de administrador…</p>
      </main>
    );
  }

  if (!admin) return null;

  const totalActivosVendedores = vendedores.filter(
    (v) => v.estado_cuenta === "activo"
  ).length;
  const totalActivosCompradores = compradores.filter(
    (c) => c.estado_cuenta === "activo"
  ).length;
  const pedidosPendientes = pedidos.filter(
    (p) => p.estado !== "entregado"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Administrador
            </h1>
            <p className="text-sm text-gray-600">
              Bienvenido, {admin.nombre} ({admin.email})
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md text-sm bg-gray-900 text-white hover:bg-black"
          >
            Cerrar sesión
          </button>
        </header>

        {/* ALERTAS */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* RESUMEN */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Vendedores activos</p>
            <p className="text-2xl font-bold">{totalActivosVendedores}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total vendedores: {vendedores.length}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Compradores activos</p>
            <p className="text-2xl font-bold">{totalActivosCompradores}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total compradores: {compradores.length}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">
              Pedidos pendientes de entrega
            </p>
            <p className="text-2xl font-bold">{pedidosPendientes}</p>
            <p className="text-xs text-gray-400 mt-1">
              Total pedidos: {pedidos.length}
            </p>
          </div>
        </section>

        {/* VENDEDOR SECTION */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Vendedores</h2>
          {vendedores.length === 0 ? (
            <p className="text-sm text-gray-500">No hay vendedores registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Nombre
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendedores.map((v) => (
                    <tr key={v.id}>
                      <td className="px-3 py-2">{v.id_vendedor ?? v.id}</td>
                      <td className="px-3 py-2">{v.nombre}</td>
                      <td className="px-3 py-2">{v.email}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            v.estado_cuenta === "activo"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {v.estado_cuenta ?? "desconocido"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          onClick={() => toggleEstadoVendedor(v)}
                          className="text-xs px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
                        >
                          {v.estado_cuenta === "activo" ? "Bloquear" : "Activar"}
                        </button>
                        <button
                          onClick={() => eliminarVendedor(v)}
                          className="text-xs px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* COMPRADORES SECTION */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Compradores</h2>
          {compradores.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay compradores registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Nombre
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {compradores.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2">{c.id_comprador ?? c.id}</td>
                      <td className="px-3 py-2">{c.nombre}</td>
                      <td className="px-3 py-2">{c.email}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            c.estado_cuenta === "activo"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {c.estado_cuenta ?? "desconocido"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          onClick={() => toggleEstadoComprador(c)}
                          className="text-xs px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
                        >
                          {c.estado_cuenta === "activo" ? "Bloquear" : "Activar"}
                        </button>
                        <button
                          onClick={() => eliminarComprador(c)}
                          className="text-xs px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PEDIDOS SECTION */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Pedidos</h2>
          {pedidos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pedidos registrados.</p>
          ) : (
            <ul className="divide-y text-sm">
              {pedidos.map((p) => (
                <li
                  key={p.id}
                  className="py-3 flex items-center justify-between"
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
      </div>
    </main>
  );
}
