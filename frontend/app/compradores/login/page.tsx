// app/compradores/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginComprador } from "@/lib/compradores";

export default function LoginCompradorPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Email y contraseña son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      const comprador = await loginComprador(email, password);

      // Guardar datos básicos en localStorage para el panel / pedidos
      window.localStorage.setItem(
        "compradorActual",
        JSON.stringify({
          id_comprador: comprador.id_comprador ?? comprador.id,
          nombre: comprador.nombre,
          email: comprador.email,
        })
      );

      // Redirigir al panel del comprador
      router.push("/compradores/panel");
    } catch (err: any) {
      // Aquí ya recibimos sólo Error(message) desde lib/compradores.ts
      setErrorMsg(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h1 className="text-xl font-bold mb-4 text-center">
          Login de comprador
        </h1>

        {errorMsg && (
          <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}
