"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { usePathname } from "next/navigation";   // 👈 IMPORTANTE

export default function Navbar() {
  const { items } = useCart();
  const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);

  const pathname = usePathname();                 // 👈 obtenemos ruta actual

  const linkClass = (href: string) =>
    `text-sm font-medium hover:opacity-90 ${
      pathname === href ? "underline" : ""
    }`;

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 text-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className={linkClass("/")}>Inicio</Link>
          <Link href="/vendedores" className={linkClass("/vendedores")}>Vendedores</Link>
          <Link href="/compradores" className={linkClass("/compradores")}>Compradores</Link>
          <Link href="/pedidos" className={linkClass("/pedidos")}>Pedidos</Link>
        </div>

        <Link
          href="/carrito"
          className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50"
        >
          <span>Carrito</span>
          {totalItems > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

