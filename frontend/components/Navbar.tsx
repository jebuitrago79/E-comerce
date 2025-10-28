"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/categorias", label: "Categorías" },
  { href: "/vendedores", label: "Vendedores" },
  { href: "/compradores", label: "Compradores" },
  { href: "/administradores", label: "Administradores" },
];


export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
        <span className="font-bold">E-commerce Admin</span>
        <ul className="flex items-center gap-4 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-2 py-1 rounded hover:bg-gray-100 ${
                  pathname === l.href ? "text-blue-600 font-medium" : "text-gray-700"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
