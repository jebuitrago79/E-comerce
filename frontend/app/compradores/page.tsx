//app/compradores/page
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Comprador } from "@/lib/types";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

type EstadoCuenta = "activo" | "bloqueado"; // ajusta si tu enum usa "inactivo"

type CRow = {
  id: number;
  id_comprador: number;
  nombre: string;
  email: string;
  estado_cuenta: EstadoCuenta | string;
  direccion: string;
  telefono: string;
  password?: string;
};

export default function CompradoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["compradores", page, pageSize],
    queryFn: () => getJSON<CRow[]>(`/compradores/?limit=${pageSize}&offset=${offset}`),
    staleTime: 1000,
  });

  // ------- Crear -------
  const [f, setF] = useState<{
    id_comprador: string;
    nombre: string;
    email: string;
    password: string;
    estado_cuenta: EstadoCuenta;
    direccion: string;
    telefono: string;
  }>({
    id_comprador: "",
    nombre: "",
    email: "",
    password: "",
    estado_cuenta: "activo",
    direccion: "",
    telefono: "",
  });

  const [msg, setMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (p: any) => postJSON<CRow>("/compradores/", p),
    onSuccess: () => {
      setMsg("✅ Comprador creado");
      setF({
        id_comprador: "",
        nombre: "",
        email: "",
        password: "",
        estado_cuenta: "activo",
        direccion: "",
        telefono: "",
      });
      qc.invalidateQueries({ queryKey: ["compradores"] });
    },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const handleCreate = () => {
    setMsg(null);
    const idNum = Number(f.id_comprador);
    if (!Number.isInteger(idNum) || idNum <= 0) return setMsg("❌ ID comprador debe ser entero positivo.");
    if (!f.nombre || !f.email || !f.password) return setMsg("❌ Nombre, correo y password son obligatorios.");
    if (!f.direccion || !f.telefono) return setMsg("❌ Dirección y teléfono son obligatorios.");

    createMut.mutate({
      id_comprador: idNum,
      nombre: f.nombre,
      email: f.email,
      password: f.password,
      estado_cuenta: f.estado_cuenta,
      direccion: f.direccion,
      telefono: f.telefono,
    });
  };

  // ------- Eliminar -------
  const deleteMut = useMutation({
    mutationFn: (id: number) => del(`/compradores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compradores"] }),
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });
  const askDelete = (c: CRow) => {
    if (confirm(`¿Eliminar comprador #${c.id}?`)) deleteMut.mutate(c.id);
  };

  // ------- Buscador -------
  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const filtered = useMemo(() => {
    if (!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter(c =>
      [c.nombre, c.email, c.direccion, c.telefono].some(x => (x ?? "").toLowerCase().includes(s))
    );
  }, [q, data]);

  // ------- Editar -------
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<CRow | null>(null);
  const [ef, setEf] = useState<CRow | null>(null);
  const openEdit = (c: CRow) => { setEdit(c); setEf({ ...c }); setOpen(true); };

  const updateMut = useMutation({
    // El router NO acepta cambiar email ni id_comprador
    mutationFn: (c: CRow) =>
      putJSON<CRow>(`/compradores/${c.id}`, {
        nombre: c.nombre,
        password: c.password && c.password.trim() !== "" ? c.password.trim() : undefined,
        estado_cuenta: c.estado_cuenta,
        direccion: c.direccion,
        telefono: c.telefono,
      }),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["compradores"] }); },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const handleSave = () => {
    if (!ef || !edit) return;
    // Limpiar password vacío para no sobreescribir
    if (!ef.password || ef.password.trim() === "") delete (ef as any).password;
    updateMut.mutate(ef);
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Compradores</h1>

      {/* Crear */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1">
          <input className="input" placeholder="ID comprador (obligatorio)"
                 value={f.id_comprador} onChange={e=>setF(s=>({...s, id_comprador:e.target.value}))}/>
        </div>
        <input className="input" placeholder="Nombre" value={f.nombre} onChange={e=>setF(s=>({...s, nombre:e.target.value}))}/>
        <input className="input" placeholder="Correo" value={f.email} onChange={e=>setF(s=>({...s, email:e.target.value}))}/>
        <input className="input" type="password" placeholder="Password" value={f.password} onChange={e=>setF(s=>({...s, password:e.target.value}))}/>
        <select className="input" value={f.estado_cuenta} onChange={e=>setF(s=>({...s, estado_cuenta:e.target.value as EstadoCuenta}))}>
          <option value="activo">activo</option>
          <option value="bloqueado">bloqueado</option>
        </select>
        <input className="input" placeholder="Dirección" value={f.direccion} onChange={e=>setF(s=>({...s, direccion:e.target.value}))}/>
        <input className="input" placeholder="Teléfono" value={f.telefono} onChange={e=>setF(s=>({...s, telefono:e.target.value}))}/>
        <div className="md:col-span-3 lg:col-span-4">
          <button className="btn-primary" onClick={handleCreate} disabled={createMut.isPending}>
            {createMut.isPending ? "Creando…" : "Crear"}
          </button>
          {msg && <span className="ml-3 text-sm">{msg}</span>}
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-3">
        <input className="input max-w-sm" placeholder="Buscar por nombre, correo, dirección o teléfono…"
               value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">ID Comprador</th>
              <th className="th">Nombre</th>
              <th className="th">Correo</th>
              <th className="th">Estado</th>
              <th className="th">Dirección</th>
              <th className="th">Teléfono</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="py-6 text-center" colSpan={8}>Cargando…</td></tr>}
            {isError && <tr><td className="py-6 text-center" colSpan={8}>Error al cargar.</td></tr>}
            {(filtered ?? []).map(c=>(
              <tr key={c.id} className="border-t">
                <td className="td">{c.id}</td>
                <td className="td">{c.id_comprador}</td>
                <td className="td">{c.nombre}</td>
                <td className="td">{c.email}</td>
                <td className="td">{c.estado_cuenta}</td>
                <td className="td">{c.direccion}</td>
                <td className="td">{c.telefono}</td>
                <td className="td text-right flex justify-end gap-2">
                  <button className="btn-primary !px-3" onClick={()=>openEdit(c)}>Editar</button>
                  <button className="btn-danger" onClick={()=>askDelete(c)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && filtered && filtered.length === 0 && (
              <tr><td className="py-6 text-center" colSpan={8}>Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} onPage={setPage}/>
      </div>

      {/* Modal editar */}
      <Modal open={open} onClose={()=>setOpen(false)} title={`Editar comprador #${edit?.id}`}>
        {ef && (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" value={ef.nombre} onChange={e=>setEf({...ef, nombre:e.target.value})}/>
            {/* Email mostrado pero no editable (no lo acepta el PUT) */}
            <input className="input bg-slate-50" value={ef.email} readOnly />
            <select className="input" value={ef.estado_cuenta as EstadoCuenta} onChange={e=>setEf({...ef, estado_cuenta: e.target.value as EstadoCuenta})}>
              <option value="activo">activo</option>
              <option value="bloqueado">bloqueado</option>
            </select>
            <input className="input" value={ef.direccion} onChange={e=>setEf({...ef, direccion:e.target.value})}/>
            <input className="input" value={ef.telefono} onChange={e=>setEf({...ef, telefono:e.target.value})}/>
            <input className="input md:col-span-2" type="password" placeholder="(opcional) nuevo password"
                   onChange={e=>setEf({...ef, password: e.target.value || (edit?.password ?? "")})}/>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button className="btn-primary" onClick={handleSave} disabled={updateMut.isPending}>
                {updateMut.isPending ? "Guardando…" : "Guardar"}
              </button>
              <button className="btn-danger" onClick={()=>setOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

