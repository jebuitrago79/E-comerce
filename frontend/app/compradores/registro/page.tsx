// app/compradores/registro/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerComprador } from "@/lib/compradores";

type Errors = {
  id?: string;          
  nombre?: string;
  email?: string;
  password?: string;
  password2?: string;
  direccion?: string;
  general?: string;
};

export default function RegistroCompradorPage() {
  const router = useRouter();
    
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const validate = (): boolean => {
    const e: Errors = {};

      // ID manual
  if (!id.trim()) {
    e.id = "El ID de comprador es obligatorio.";
  }



    if (!nombre.trim()) {
      e.nombre = "El nombre es obligatorio.";
    }

    if (!email.trim()) {
      e.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Ingrese un correo electrónico válido.";
    }

    if (!password) {
      e.password = "La contraseña es obligatoria.";
    } else if (password.length < 8) {
      e.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!password2) {
      e.password2 = "Debe confirmar la contraseña.";
    } else if (password && password2 && password !== password2) {
      e.password2 = "Las contraseñas no coinciden.";
    }

    if (!direccion.trim()) {
      e.direccion = "La dirección es obligatoria para el envío.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOkMsg(null);

    if (!validate()) return;

    try {
      setLoading(true);

await registerComprador({
  id_comprador: id.trim(),           // 👈 AÑADIDO
  nombre: nombre.trim(),
  email: email.trim(),
  password,
  direccion: direccion.trim(),
  telefono: telefono.trim() || undefined,
});

      setOkMsg("Registro exitoso. Ahora puede iniciar sesión.");
      // Redirigimos al login después de un pequeño delay, o inmediatamente:
      setTimeout(() => {
        router.push("/compradores/login");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      const detail = err?.message || "No se pudo completar el registro.";
      setErrors((prev) => ({ ...prev, general: detail }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Registro de comprador
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre completo
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errors.nombre && (
              <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>
            )}
          </div>

        {/* ID comprador manual */}
        <div>
  <label className="block text-sm font-medium mb-1">
    ID de comprador (manual)
  </label>
  <input
    className="w-full border rounded px-3 py-2 text-sm"
    value={id}
    onChange={(e) => setId(e.target.value)}
    required
  />
  {errors.id && (
    <p className="text-xs text-red-600 mt-1">{errors.id}</p>
  )}
</div>


          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>
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

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            {errors.password2 && (
              <p className="text-xs text-red-600 mt-1">{errors.password2}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Dirección de entrega
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm h-20"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
            {errors.direccion && (
              <p className="text-xs text-red-600 mt-1">{errors.direccion}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Teléfono de contacto (opcional)
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
