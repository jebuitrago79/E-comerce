"use client";

export default function Home() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <a href="/categorias" className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
        <h3 className="font-semibold">Categorías</h3>
        <p className="text-sm text-gray-500">Crea y gestiona categorías del catálogo.</p>
      </a>

      <a href="/vendedores" className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
        <h3 className="font-semibold">Vendedores</h3>
        <p className="text-sm text-gray-500">Administra vendedores de tu tienda.</p>
      </a>

      <a href="/compradores" className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
        <h3 className="font-semibold">Compradores</h3>
        <p className="text-sm text-gray-500">Registra/gestiona tus clientes compradores.</p>
      </a>

      <a href="/administradores" className="bg-white rounded-xl border p-6 hover:shadow-sm transition">
        <h3 className="font-semibold">Administradores</h3>
        <p className="text-sm text-gray-500">Usuarios internos con permisos.</p>
      </a>
    </div>
  );
}
