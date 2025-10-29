"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/vendedores", label: "Vendedores" },
  { href: "/compradores", label: "Compradores" },
  { href: "/productos",  label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/usuarios",   label: "Usuarios" }, // si luego agregas
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-6">
        {tabs.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`text-sm font-medium hover:opacity-90 ${active ? "underline" : ""}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
