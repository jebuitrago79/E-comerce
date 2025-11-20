"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { postJSON } from "@/lib/api";

type VendedorRead = {
  id: number;
  id_vendedor: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  estado_cuenta: "activo" | "bloqueado";
};

export default function VendedorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const data = await postJSON<VendedorRead>("/vendedores/login", {
      email,
      password,
    });

    if (typeof window !== "undefined") {
      // 👇 usa SIEMPRE la misma clave que leerá el panel
      localStorage.setItem("vendedor", JSON.stringify(data));

      // opcional, si quieres seguir teniendo el id por separado:
      localStorage.setItem("id_vendedor", String(data.id_vendedor));
    }

    router.push("/vendedores/panel");
  } catch (err: any) {
    const msg =
      err?.message ||
      err?.detail ||
      "Error al iniciar sesión. Verifique sus datos.";
    setError(msg);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Iniciar sesión como vendedor
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Use el correo y contraseña que registró como vendedor.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
