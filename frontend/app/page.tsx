import Link from "next/link";
import Card from "@/components/Card";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Columna izquierda: texto principal */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a tu plataforma E-commerce
          </h1>
          <p className="text-gray-700 mb-4">
            Elija cómo quiere entrar a la plataforma. Cada tipo de usuario
            tendrá un panel distinto con herramientas específicas.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Vendedor:</strong> crea tu tienda, categorías y productos.</li>
            <li><strong>Comprador:</strong> explora tiendas y compra productos.</li>
            <li><strong>Administrador:</strong> gestiona usuarios, tiendas y actividad.</li>
          </ul>
        </section>

        {/* Columna derecha: tarjetas de acceso */}
        <section className="grid gap-4 md:grid-rows-3">
          {/* Vendedor */}
          <Card title="Soy Vendedor">
            <p className="text-sm text-gray-600 mb-3">
              Configura tu tienda, administra tus productos y categorías.
            </p>
            <div className="flex gap-3">
              <Link
                href="/vendedores/login"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
              Iniciar sesión
              </Link>
              <Link
                href="/vendedores/registro"
                className="px-4 py-2 rounded-md border text-sm font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 transition"
              >
                Registrarme
              </Link>
            </div>
          </Card>

          {/* Comprador */}
          <Card title="Soy Comprador">
            <p className="text-sm text-gray-600 mb-3">
              Crea tu cuenta para guardar compras y seguir tus pedidos.
            </p>
            <div className="flex gap-3">
              <Link
                href="/compradores/login"
                className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/compradores/registro"
                className="px-4 py-2 rounded-md border text-sm font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 transition"
              >
                Registrarme
              </Link>
            </div>
          </Card>

          {/* Administrador */}
          <Card title="Soy Administrador">
            <p className="text-sm text-gray-600 mb-3">
              Acceda al panel para supervisar usuarios, tiendas y productos.
            </p>
            <Link
              href="/administradores/login"
              className="inline-flex px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition"
            >
              Iniciar sesión como admin
            </Link>
          </Card>
        </section>
      </div>
    </main>
  );
}
