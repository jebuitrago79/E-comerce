"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/vendedores", label: "Vendedores" },
  { href: "/compradores", label: "Compradores" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/administradores", label: "Administrador" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      // limpiamos lo que usamos para la sesión del vendedor
      localStorage.removeItem("vendedorActual");
      localStorage.removeItem("id_vendedor");
      // si más adelante usas sesiones para comprador/admin, también las borras aquí
      // localStorage.removeItem("compradorActual");
      // localStorage.removeItem("adminActual");
    }

    // 👉 redirige al panel inicial de selección de rol
    router.push("/"); // cambia "/" si tu pantalla inicial está en otra ruta
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex gap-6">
          {tabs.map((t) => {
            const active = path?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`text-sm font-medium hover:opacity-90 ${
                  active ? "underline" : ""
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-200 hover:text-red-100"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
