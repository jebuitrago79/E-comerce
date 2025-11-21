//app/vendedores/login/page
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginVendedor } from "@/lib/vendedores";

type Errors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginVendedorPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // ------- validaciones en frontend -------
  const validate = (): boolean => {
    const newErrors: Errors = {};

    // Email
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Ingrese un email válido.";
    }

    // Password
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOkMsg(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const vendedor = await loginVendedor(email.trim(), password);

      // Guardar sesión en localStorage
if (vendedor) {
  // Objeto completo para el panel/tienda
  localStorage.setItem("vendedorActual", JSON.stringify(vendedor));
  // ID manual como string para otras pantallas
  localStorage.setItem("id_vendedor", String(vendedor.id_vendedor));
}

      setOkMsg("Ingreso exitoso.");

      // 👉 Redirigir al panel o productos del vendedor
      if (vendedor?.id_vendedor) {
        router.push("/vendedores/panel");
      }
    } catch (err: any) {
      console.error(err);
      const detail =
        err?.response?.data?.detail ||
        "No se pudo iniciar sesión. Verifique sus datos.";
      setErrors((prev) => ({ ...prev, general: String(detail) }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login de vendedor
        </h1>

        {errors.general && (
          <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {errors.general}
          </div>
        )}

        {okMsg && (
          <div className="mb-3 rounded bg-green-100 text-green-700 px-3 py-2 text-sm">
            {okMsg}
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
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}
