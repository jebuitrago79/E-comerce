// app/vendedores/registro/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { crearVendedor } from "@/lib/vendedores";

type Errors = {
  idVendedor?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  password?: string;
  general?: string;
};

export default function RegistroVendedorPage() {
  const router = useRouter();

  const [idVendedor, setIdVendedor] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // -------- validación en frontend --------
  const validate = (): boolean => {
    const newErrors: Errors = {};

    // ID vendedor
    if (!idVendedor) {
      newErrors.idVendedor = "El ID de vendedor es obligatorio.";
    } else if (!/^[0-9]+$/.test(idVendedor)) {
      newErrors.idVendedor = "Solo se permiten números.";
    } else if (Number(idVendedor) <= 0) {
      newErrors.idVendedor = "El ID debe ser mayor que 0.";
    }

    // Nombre
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres.";
    } else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.\-]+$/.test(nombre.trim())) {
      newErrors.nombre =
        "El nombre solo puede contener letras, números, espacios, punto y guion.";
    }

    // Email
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Ingrese un email válido.";
    }

    // Teléfono (opcional)
    if (telefono.trim()) {
      if (!/^[0-9+\-\s]+$/.test(telefono.trim())) {
        newErrors.telefono =
          "El teléfono solo puede tener números, espacios, + y -.";
      } else if (
        telefono.replace(/[^0-9]/g, "").length < 7 ||
        telefono.replace(/[^0-9]/g, "").length > 20
      ) {
        newErrors.telefono = "El teléfono debe tener entre 7 y 20 dígitos.";
      }
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
    setOkMsg(null);
    setErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        id_vendedor: Number(idVendedor),
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        password,
      };

      await crearVendedor(payload as any);

      setOkMsg("Vendedor creado correctamente.");
      // Si quieres redirigir después de 1–2 segundos:
      // setTimeout(() => router.push("/vendedores/login"), 1500);
    } catch (err: any) {
      console.error(err);
      const detail =
        err?.response?.data?.detail ||
        "No se pudo registrar el vendedor. Intente de nuevo.";
      setErrors((prev) => ({ ...prev, general: String(detail) }));
    } finally {
      setLoading(false);
    }
  };

  // -------- filtros en la escritura (caracteres) --------
  const handleIdChange = (value: string) => {
    // solo números y máx 9 dígitos
    const soloNums = value.replace(/\D/g, "").slice(0, 9);
    setIdVendedor(soloNums);
  };

  const handleNombreChange = (value: string) => {
    // permitimos letras, números, espacios, punto y guion
    const limpio = value
      .replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.\-]/g, "")
      .slice(0, 80);
    setNombre(limpio);
  };

  const handleTelefonoChange = (value: string) => {
    // números, espacios, + y -
    const limpio = value.replace(/[^0-9+\-\s]/g, "").slice(0, 20);
    setTelefono(limpio);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Registro de vendedor
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
          {/* ID vendedor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ID vendedor (manual)
            </label>
            <input
              type="text"
              value={idVendedor}
              onChange={(e) => handleIdChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              inputMode="numeric"
            />
            {errors.idVendedor && (
              <p className="text-xs text-red-600 mt-1">{errors.idVendedor}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {errors.nombre && (
              <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            {errors.telefono && (
              <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
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
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </main>
  );
}
