"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const router = useRouter();
  const { items, total, removeItem, updateCantidad } = useCart(); // 👈 sin clearCart

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Tu carrito está vacío</p>
          <p className="text-sm text-gray-500">
            Ve a una tienda y agrega productos al carrito.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Mi carrito</h1>
        </header>

        <section className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white rounded-lg border border-gray-100 px-4 py-3"
            >
              {item.imagen_url && (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="h-16 w-16 rounded object-cover bg-gray-100"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">
                  ${item.precio} x {item.cantidad}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-2 rounded bg-slate-100"
                  onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">{item.cantidad}</span>
                <button
                  className="px-2 rounded bg-slate-100"
                  onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                >
                  +
                </button>
                <button
                  className="ml-3 text-xs text-red-600"
                  onClick={() => removeItem(item.id)}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </section>

        <footer className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total: ${total}</span>
          <button
            onClick={() => router.push("/checkout")}
            className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Finalizar compra
          </button>
        </footer>
      </div>
    </main>
  );
}
