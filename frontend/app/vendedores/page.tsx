"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Vendedor, Estado } from "@/lib/types";
import { useMemo, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

type VRow = {
  id?: number;                // algunas APIs lo devuelven así
  id_vendedor?: number;       // otras APIs lo devuelven así
  nombre: string;
  email: string;
  telefono?: string | null;
  empresa?: string | null;
  direccion?: string | null;
  estado_cuenta: "activo" | "bloqueado" | string;
  password?: string;
};

const getIdPk = (v: Pick<VRow, "id" | "id_vendedor">) => (v.id ?? v.id_vendedor)!;

export default function VendedoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendedores", page, pageSize],
    queryFn: () => getJSON<VRow[]>(`/vendedores/?limit=${pageSize}&offset=${offset}`),
    staleTime: 1000,
  });

  // --- BÚSQUEDA (cliente)
  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const filtered = useMemo(() => {
    if (!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter(v =>
      [v.nombre, v.email, v.empresa, v.telefono, v.direccion]
        .some(x => (x ?? "").toLowerCase().includes(s))
    );
  }, [q, data]);

  // --- CREAR
  const [form, setForm] = useState({
    id: "" as string, // id_vendedor manual
    nombre: "", email: "", password: "",
    telefono: "", empresa: "", direccion: "",
    estado_cuenta: "activo" as "activo" | "bloqueado",
  });
  const [msg, setMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: any) => postJSON<VRow>("/vendedores/", payload),
    onSuccess: () => {
      setMsg("✅ Vendedor creado");
      setForm({ id:"", nombre:"", email:"", password:"", telefono:"", empresa:"", direccion:"", estado_cuenta:"activo" });
      qc.invalidateQueries({ queryKey: ["vendedores"] });
    },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const handleCreate = async () => {
    setMsg(null);
    const idNum = Number(form.id);
    if (!Number.isInteger(idNum) || idNum <= 0) return setMsg("❌ ID debe ser entero positivo.");
    if (!form.nombre || !form.email || !form.password) return setMsg("❌ Nombre, Email y Password son obligatorios.");
    await createMut.mutateAsync({
      id_vendedor: idNum,
      nombre: form.nombre,
      email: form.email,
      password: form.password,
      telefono: form.telefono || null,
      empresa: form.empresa || null,
      direccion: form.direccion || null,
      estado_cuenta: form.estado_cuenta, // "activo" | "bloqueado"
    });
  };

  // --- ELIMINAR
  const deleteMut = useMutation({
    mutationFn: (idPk: number) => del(`/vendedores/${idPk}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendedores"] }),
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const askDelete = (v: VRow) => {
    const idPk = getIdPk(v);
    if (confirm(`¿Eliminar vendedor #${idPk}?`)) deleteMut.mutate(idPk);
  };

  // --- EDITAR (modal)
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<VRow | null>(null);
  const [ef, setEf] = useState<VRow | null>(null);

  const openEdit = (v: VRow) => {
    setEdit(v);
    // Clonar y normalizar estado para el select
    const estado = (v.estado_cuenta === "bloqueado" ? "bloqueado" : "activo") as "activo" | "bloqueado";
    setEf({ ...v, estado_cuenta: estado });
    setOpen(true);
  };

  const updateMut = useMutation({
    mutationFn: ({ idPk, payload }: { idPk: number; payload: Partial<VRow> }) =>
      putJSON<VRow>(`/vendedores/${idPk}`, payload),
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["vendedores"] });
    },
    onError: (e: any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const handleSave = () => {
    if (!ef || !edit) return;
    const idPk = getIdPk(edit);

    // Solo enviar cambios y omitir password si no se escribió algo
    const payload: Partial<VRow> = {};
    (["nombre","email","telefono","empresa","direccion","estado_cuenta"] as const).forEach(k => {
      if ((ef as any)[k] !== (edit as any)[k]) (payload as any)[k] = (ef as any)[k];
    });
    if (ef.password && ef.password.trim() !== "") payload.password = ef.password.trim();

    updateMut.mutate({ idPk, payload });
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-1">Vendedores</h1>
      <p className="text-sm text-slate-600 mb-6">ID manual obligatorio. Estado: activo/bloqueado.</p>

      {/* Crear */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div><label className="block text-sm mb-1">ID (obligatorio)</label>
          <input className="input" value={form.id} onChange={e=>setForm(s=>({...s,id:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Nombre</label>
          <input className="input" value={form.nombre} onChange={e=>setForm(s=>({...s,nombre:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Email</label>
          <input className="input" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Password</label>
          <input type="password" className="input" value={form.password} onChange={e=>setForm(s=>({...s,password:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Teléfono</label>
          <input className="input" value={form.telefono} onChange={e=>setForm(s=>({...s,telefono:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Empresa</label>
          <input className="input" value={form.empresa} onChange={e=>setForm(s=>({...s,empresa:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Dirección</label>
          <input className="input" value={form.direccion} onChange={e=>setForm(s=>({...s,direccion:e.target.value}))}/></div>
        <div><label className="block text-sm mb-1">Estado</label>
          <select className="input" value={form.estado_cuenta} onChange={e=>setForm(s=>({...s,estado_cuenta:e.target.value as any}))}>
            <option value="activo">activo</option>
            <option value="bloqueado">bloqueado</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full" onClick={handleCreate} disabled={createMut.isPending}>
            {createMut.isPending ? "Creando…" : "Crear"}
          </button>
        </div>
        {msg && <p className="col-span-full text-sm">{msg}</p>}
      </div>

      {/* Buscador */}
      <div className="mb-3">
        <input className="input max-w-sm" placeholder="Buscar por nombre/email/empresa…" value={search}
               onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="th">ID</th><th className="th">Nombre</th><th className="th">Email</th>
              <th className="th">Teléfono</th><th className="th">Empresa</th><th className="th">Estado</th>
              <th className="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="py-6 text-center" colSpan={7}>Cargando…</td></tr>}
            {isError && <tr><td className="py-6 text-center" colSpan={7}>Error al cargar.</td></tr>}
            {filtered.map(v=>(
              <tr key={getIdPk(v)} className="border-t">
                <td className="td">{v.id ?? v.id_vendedor}</td>
                <td className="td">{v.nombre}</td>
                <td className="td">{v.email}</td>
                <td className="td">{v.telefono ?? "-"}</td>
                <td className="td">{v.empresa ?? "-"}</td>
                <td className="td">{v.estado_cuenta}</td>
                <td className="td text-right flex gap-2 justify-end">
                  <button className="btn-primary !px-3" onClick={()=>openEdit(v)}>Editar</button>
                  <button className="btn-danger" onClick={()=>askDelete(v)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr><td className="py-6 text-center" colSpan={7}>Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} onPage={setPage}/>
      </div>

      {/* Modal editar */}
      <Modal open={open} onClose={()=>setOpen(false)} title={`Editar vendedor #${edit ? (edit.id ?? edit.id_vendedor) : ""}`}>
        {ef && (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" value={ef.nombre} onChange={e=>setEf({...ef, nombre:e.target.value})}/>
            <input className="input" value={ef.email} onChange={e=>setEf({...ef, email:e.target.value})}/>
            <input className="input" value={ef.telefono ?? ""} onChange={e=>setEf({...ef, telefono:e.target.value})}/>
            <input className="input" value={ef.empresa ?? ""} onChange={e=>setEf({...ef, empresa:e.target.value})}/>
            <input className="input" value={ef.direccion ?? ""} onChange={e=>setEf({...ef, direccion:e.target.value})}/>
            <select className="input" value={ef.estado_cuenta} onChange={e=>setEf({...ef, estado_cuenta:e.target.value as any})}>
              <option value="activo">activo</option>
              <option value="bloqueado">bloqueado</option>
            </select>
            <input
              className="input md:col-span-2"
              type="password"
              placeholder="(opcional) nuevo password"
              onChange={e=>setEf({...ef, password: e.target.value})}
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button className="btn-primary" onClick={handleSave}>Guardar</button>
              <button className="btn-danger" onClick={()=>setOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

