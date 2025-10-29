"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Estado } from "@/lib/types";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

// Tipos mínimos locales (ajusta si ya los tienes en "@/lib/types")
type Administrador = {
  id?: number;        // PK real si existe
  id_admin: number;   // identificador visible
  nombre: string;
  email: string;
  password?: string;
  nivel_acceso: number | string;
  estado_cuenta: Estado | "activo" | "inactivo";
};

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  estado_cuenta: "activo" | "bloqueado" | Estado;
};

// Fallback para PATCH si tu lib no lo trae
async function patchJSON<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `PATCH ${url} failed`);
  }
  return res.json();
}

export default function AdministradoresPage() {
  const qc = useQueryClient();

  // --- Paginación SOLO visual (el backend devuelve todo)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ====== ADMINISTRADORES ======
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["administradores"],
    queryFn: () => getJSON<Administrador[]>("/administradores/"),
    staleTime: 1000,
  });

  const [f, setF] = useState({
    nombre: "",
    email: "",
    password: "",
    nivel_acceso: "1",
    estado_cuenta: "activo" as Estado,
    id_admin: Number(Math.floor(Math.random() * 100000)), // si tu modelo lo requiere
  });
  const [msg, setMsg] = useState<string | null>(null);

  const createAdmin = useMutation({
    mutationFn: (p: typeof f) =>
      postJSON<Administrador>("/administradores/", {
        ...p,
        nivel_acceso: Number(p.nivel_acceso),
      }),
    onSuccess: () => {
      setMsg("✅ Administrador creado");
      setF({
        nombre: "",
        email: "",
        password: "",
        nivel_acceso: "1",
        estado_cuenta: "activo" as Estado,
        id_admin: Number(Math.floor(Math.random() * 100000)),
      });
      qc.invalidateQueries({ queryKey: ["administradores"] });
    },
    onError: (e: any) =>
      setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  // Búsqueda cliente
  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const adminsFiltered = useMemo(() => {
    const all = admins ?? [];
    if (!q) return all;
    const s = q.toLowerCase();
    return all.filter((a) =>
      [a.nombre, a.email].some((x) => (x ?? "").toLowerCase().includes(s))
    );
  }, [q, admins]);

  // slice para la tabla (paginación visual)
  const start = (page - 1) * pageSize;
  const adminsPage = adminsFiltered.slice(start, start + pageSize);

  // ====== USUARIOS (para bloquear / eliminar) ======
  const { data: usuarios = [] } = useQuery({
    queryKey: ["administradores", "usuarios"],
    queryFn: () => getJSON<Usuario[]>("/administradores/usuarios"),
  });

  const bloquearUsuario = useMutation({
    mutationFn: (id: number) =>
      putJSON(`/administradores/usuarios/${id}/bloquear`, {}),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["administradores", "usuarios"] }),
  });

  const eliminarUsuario = useMutation({
    mutationFn: (id: number) => del(`/administradores/usuarios/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["administradores", "usuarios"] }),
  });

  // ====== EDITAR ADMIN ======
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Administrador | null>(null);
  const [ef, setEf] = useState<Administrador | null>(null);
  const openEdit = (a: Administrador) => {
    setEdit(a);
    setEf({ ...a, nivel_acceso: Number(a.nivel_acceso) });
    setOpen(true);
  };

  // PUT /administradores/{id_admin}
  const updateMut = useMutation({
    mutationFn: (a: Administrador) =>
      putJSON<Administrador>(`/administradores/${a.id_admin}`, {
        nombre: a.nombre,
        email: a.email,
        password: a.password || undefined, // no enviar si está vacío
        nivel_acceso: Number(a.nivel_acceso),
        estado_cuenta: a.estado_cuenta,
      }),
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["administradores"] });
    },
  });

  // Activar / Desactivar (PUT preferido; si tu backend dejó PATCH, hace fallback)
  const toggleEstado = useMutation({
    mutationFn: async ({
      id_admin,
      estado,
    }: {
      id_admin: number;
      estado: "activo" | "inactivo";
    }) => {
      try {
        return await putJSON<Administrador>(
          `/administradores/${id_admin}/estado`,
          { estado_cuenta: estado }
        );
      } catch {
        return await patchJSON<Administrador>(
          `/administradores/${id_admin}/estado`,
          { estado_cuenta: estado }
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["administradores"] }),
  });

  // (Opcional) DELETE lógico -> pone "inactivo"
  const softDelete = useMutation({
    mutationFn: (id_admin: number) => del(`/administradores/${id_admin}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["administradores"] }),
  });

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Administradores</h1>

      {/* Crear administrador */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-6">
        <input
          className="input"
          placeholder="Nombre"
          value={f.nombre}
          onChange={(e) => setF((s) => ({ ...s, nombre: e.target.value }))}
        />
        <input
          className="input"
          placeholder="Email"
          value={f.email}
          onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={f.password}
          onChange={(e) => setF((s) => ({ ...s, password: e.target.value }))}
        />
        <input
          className="input"
          placeholder="ID Admin"
          value={f.id_admin}
          onChange={(e) =>
            setF((s) => ({ ...s, id_admin: Number(e.target.value) || 0 }))
          }
        />
        <input
          className="input"
          placeholder="Nivel (número)"
          value={f.nivel_acceso}
          onChange={(e) =>
            setF((s) => ({ ...s, nivel_acceso: e.target.value }))
          }
        />
        <select
          className="input"
          value={f.estado_cuenta}
          onChange={(e) =>
            setF((s) => ({ ...s, estado_cuenta: e.target.value as Estado }))
          }
        >
          <option value="activo">activo</option>
          <option value="inactivo">inactivo</option>
        </select>

        <div className="md:col-span-6 flex items-center gap-3">
          <button
            className="btn-primary"
            onClick={() => createAdmin.mutate(f)}
          >
            Crear
          </button>
          {msg && <span className="text-sm">{msg}</span>}
          <input
            className="input ml-auto max-w-sm"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla administradores */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">ID Admin</th>
              <th className="th">Nombre</th>
              <th className="th">Correo</th>
              <th className="th">Nivel</th>
              <th className="th">Estado</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {adminsPage.map((a) => (
              <tr key={a.id ?? a.id_admin} className="border-t">
                <td className="td">{a.id ?? "-"}</td>
                <td className="td">{a.id_admin}</td>
                <td className="td">{a.nombre}</td>
                <td className="td">{a.email}</td>
                <td className="td">{a.nivel_acceso}</td>
                <td className="td">{a.estado_cuenta}</td>
                <td className="td text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn-primary !px-3" onClick={() => openEdit(a)}>
                      Editar
                    </button>

                    {a.estado_cuenta === "activo" ? (
                      <button
                        className="btn-warning"
                        onClick={() =>
                          toggleEstado.mutate({
                            id_admin: a.id_admin,
                            estado: "inactivo",
                          })
                        }
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="btn-success"
                        onClick={() =>
                          toggleEstado.mutate({
                            id_admin: a.id_admin,
                            estado: "activo",
                          })
                        }
                      >
                        Activar
                      </button>
                    )}

                    <button
                      className="btn-danger"
                      onClick={() => softDelete.mutate(a.id_admin)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {adminsPage.length === 0 && !isLoading && (
              <tr>
                <td className="td" colSpan={7}>
                  Sin datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={pageSize} onPage={setPage} total={adminsFiltered.length} />

      {/* === Sección Usuarios administrables === */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Usuarios</h2>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">Nombre</th>
              <th className="th">Correo</th>
              <th className="th">Estado</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="td">{u.id}</td>
                <td className="td">{u.nombre}</td>
                <td className="td">{u.email}</td>
                <td className="td">{u.estado_cuenta}</td>
                <td className="td text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-primary !px-3"
                      onClick={() => bloquearUsuario.mutate(u.id)}
                      disabled={u.estado_cuenta === "bloqueado"}
                    >
                      Bloquear
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => eliminarUsuario.mutate(u.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td className="td" colSpan={5}>
                  Sin usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal editar admin */}
      <Modal open={open} onClose={() => setOpen(false)} title={`Editar administrador #${edit?.id_admin ?? ""}`}>
        {ef && (
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="input"
              value={ef.nombre}
              onChange={(e) => setEf({ ...ef, nombre: e.target.value })}
              placeholder="Nombre"
            />
            <input
              className="input"
              value={ef.email}
              onChange={(e) => setEf({ ...ef, email: e.target.value })}
              placeholder="Email"
            />
            <input
              className="input"
              type="password"
              placeholder="(opcional) nuevo password"
              onChange={(e) =>
                setEf({ ...ef, password: e.target.value || (edit?.password ?? "") })
              }
            />
            <input
              className="input"
              value={ef.nivel_acceso}
              onChange={(e) =>
                setEf({ ...ef, nivel_acceso: Number(e.target.value) })
              }
              placeholder="Nivel"
            />
            <select
              className="input"
              value={ef.estado_cuenta}
              onChange={(e) =>
                setEf({ ...ef, estado_cuenta: e.target.value as Estado })
              }
            >
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button className="btn-primary" onClick={() => ef && updateMut.mutate(ef)}>
                Guardar
              </button>
              <button className="btn-danger" onClick={() => setOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
