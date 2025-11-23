// app/checkout/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { postJSON } from "@/lib/api";

type PedidoResponse = {
  id: number;
  estado: string;
  // si tu backend devuelve más campos los puedes añadir aquí
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "contra_entrega">(
    "tarjeta"
  );
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Tu carrito está vacío. Agrega productos antes de finalizar la compra.
        </p>
      </main>
    );
  }

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setMensaje(null);
  setError(null);

  if (!nombre || !email || !direccion) {
    setError("Nombre, correo y dirección son obligatorios.");
    return;
  }

  // 👉 NUEVO: obtener comprador logueado
  let compradorId: number | null = null;
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("compradorActual");
    if (raw) {
      try {
        const comprador = JSON.parse(raw);
        // usamos el id_manual, ajusta si en tu objeto se llama distinto
        compradorId = Number(comprador?.id_comprador);
      } catch (e) {
        console.error("Error leyendo compradorActual", e);
      }
    }
  }

  if (!compradorId || Number.isNaN(compradorId)) {
    setError("Debe iniciar sesión como comprador antes de confirmar el pedido.");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      comprador_id: compradorId,        // 👈 IMPORTANTE
      nombre_cliente: nombre,
      email_cliente: email,
      direccion,
      telefono: telefono || undefined,
      metodo_pago: metodoPago,
      total,
      estado: "pendiente_entrega",
      items: items.map((i) => ({
        producto_id: i.id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad,
      })),
    };

    const pedido = await postJSON<{
      id: number;
      estado: string;
    }>("/pedidos", payload);

    clearCart();
    setMensaje(
      `🎉 Pedido creado correctamente. Número de pedido: #${pedido.id}. Estado: ${pedido.estado}`
    );
  } catch (err: any) {
    console.error(err);
    setError(
      err?.response?.data?.detail ||
        "No se pudo crear el pedido. Intenta de nuevo."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-[2fr,1.5fr]">
        {/* Formulario comprador / envío */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold mb-4">Datos de envío y pago</h1>

          {error && (
            <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-3 rounded bg-emerald-100 text-emerald-700 px-3 py-2 text-sm">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre completo
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Dirección de entrega
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm h-20"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Teléfono de contacto (opcional)
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {/* “Pasarela” simulada: solo elegimos método de pago */}
            <div>
              <p className="block text-sm font-medium mb-1">
                Método de pago (simulado)
              </p>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="tarjeta"
                    checked={metodoPago === "tarjeta"}
                    onChange={() => setMetodoPago("tarjeta")}
                  />
                  Tarjeta (simulación)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodo_pago"
                    value="contra_entrega"
                    checked={metodoPago === "contra_entrega"}
                    onChange={() => setMetodoPago("contra_entrega")}
                  />
                  Pago contra entrega
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creando pedido..." : "Confirmar pedido"}
            </button>
          </form>
        </section>

        {/* Resumen del pedido */}
        <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-3">Resumen del pedido</h2>
          <ul className="divide-y text-sm">
            {items.map((i) => (
              <li key={i.id} className="py-2 flex justify-between">
                <div>
                  <p className="font-medium">{i.nombre}</p>
                  <p className="text-xs text-gray-500">
                    Cantidad: {i.cantidad}
                  </p>
                </div>
                <p className="font-semibold">
                  ${i.precio * i.cantidad}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-emerald-700">${total}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
