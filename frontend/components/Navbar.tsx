"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { items } = useCart();
  const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (href: string) =>
    `text-sm font-medium hover:opacity-90 ${
      pathname === href ? "underline" : ""
    }`;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("compradorActual");
      window.localStorage.removeItem("vendedorActual");
    }
    router.push("/"); // te manda al inicio
  };

  return (
    <nav className="w-full border-b bg-slate-900/90 backdrop-blur text-slate-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 text-sm">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 font-semibold">
            <span className="h-6 w-6 rounded-full bg-indigo-500 text-xs flex items-center justify-center text-white">
              EC
            </span>
            <span className="hidden sm:inline">Plataforma E-commerce</span>
          </span>

          <div className="hidden sm:flex items-center gap-3 ml-6">
            <Link href="/" className={linkClass("/")}>
              Inicio
            </Link>
            <Link href="/pedidos" className={linkClass("/pedidos")}>
              Pedidos
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md border border-slate-600 text-xs hover:bg-slate-800"
          >
            Cerrar sesión
          </button>

          {/* Carrito */}
          <Link
            href="/carrito"
            className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs"
          >
            <span>Carrito</span>
            {totalItems > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
