// app/administradores/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdministrador } from "@/lib/administradores";

type Errors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginAdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};

    if (!email.trim()) {
      e.email = "El email es obligatorio.";
    }

    if (!password.trim()) {
      e.password = "La contraseña es obligatoria.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      // 👇 usamos loginAdministrador (no loginAdmin)
      const admin = await loginAdministrador(email.trim(), password.trim());

      // guardamos sesión
      localStorage.setItem("adminActual", JSON.stringify(admin));

      // 👇 ruta ajustada a tu carpeta /administradores
      router.push("/administradores/panel");
    } catch (err: any) {
      setErrors({
        general: err?.message || "No se pudo iniciar sesión.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login de Administrador
        </h1>

        {errors.general && (
          <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded font-medium hover:bg-black disabled:opacity-60"
          >     
            {loading ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}
