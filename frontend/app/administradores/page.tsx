"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Administrador, Estado } from "@/lib/types";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

export default function AdministradoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data } = useQuery({
    queryKey: ["administradores", page, pageSize],
    queryFn: () => getJSON<Administrador[]>(`/administradores/?limit=${pageSize}&offset=${offset}`),
  });

  const [f, setF] = useState({ nombre:"", email:"", password:"", nivel_acceso:"1", estado_cuenta: "activo" as Estado });
  const [msg, setMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (p:any) => postJSON<Administrador>("/administradores/", { ...p, nivel_acceso: Number(p.nivel_acceso) }),
    onSuccess: () => { setMsg("✅ Administrador creado"); setF({ nombre:"", email:"", password:"", nivel_acceso:"1", estado_cuenta:"activo" }); qc.invalidateQueries({ queryKey: ["administradores"] });},
    onError: (e:any)=> setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id:number) => del(`/administradores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["administradores"] }),
  });

  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const filtered = useMemo(()=>{
    if(!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter(a => [a.nombre,a.email].some(x => (x??"").toLowerCase().includes(s)));
  },[q, data]);

  // editar
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Administrador | null>(null);
  const [ef, setEf] = useState<Administrador | null>(null);
  const openEdit = (a:Administrador) => { setEdit(a); setEf({...a}); setOpen(true); };

  const updateMut = useMutation({
    mutationFn: (a:Administrador) => putJSON<Administrador>(`/administradores/${a.id_admin}`, {
      nombre: a.nombre, email: a.email, password: a.password,
      nivel_acceso: a.nivel_acceso, estado_cuenta: a.estado_cuenta
    }),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["administradores"]}); },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Administradores</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-5">
        <input className="input" placeholder="Nombre" value={f.nombre} onChange={e=>setF(s=>({...s,nombre:e.target.value}))}/>
        <input className="input" placeholder="Email" value={f.email} onChange={e=>setF(s=>({...s,email:e.target.value}))}/>
        <input className="input" type="password" placeholder="Password" value={f.password} onChange={e=>setF(s=>({...s,password:e.target.value}))}/>
        <input className="input" placeholder="Nivel (número)" value={f.nivel_acceso} onChange={e=>setF(s=>({...s,nivel_acceso:e.target.value}))}/>
        <select className="input" value={f.estado_cuenta} onChange={e=>setF(s=>({...s,estado_cuenta:e.target.value as Estado}))}>
          <option value="activo">activo</option><option value="inactivo">inactivo</option>
        </select>
        <div className="md:col-span-5 flex items-center gap-3">
          <button className="btn-primary" onClick={()=>createMut.mutate(f)}>Crear</button>
          {msg && <span className="text-sm">{msg}</span>}
          <input className="input ml-auto max-w-sm" placeholder="Buscar por nombre o correo…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <table className="w-full bg-white rounded-xl shadow text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="th">ID</th><th className="th">Nombre</th><th className="th">Correo</th>
            <th className="th">Nivel</th><th className="th">Estado</th><th className="th text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a=>(
            <tr key={a.id_admin} className="border-t">
              <td className="td">{a.id_admin}</td>
              <td className="td">{a.nombre}</td>
              <td className="td">{a.email}</td>
              <td className="td">{a.nivel_acceso}</td>
              <td className="td">{a.estado_cuenta}</td>
              <td className="td text-right flex justify-end gap-2">
                <button className="btn-primary !px-3" onClick={()=>openEdit(a)}>Editar</button>
                <button className="btn-danger" onClick={()=>deleteMut.mutate(a.id_admin)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageSize={pageSize} onPage={setPage}/>

      <Modal open={open} onClose={()=>setOpen(false)} title={`Editar administrador #${edit?.id_admin}`}>
        {ef && (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" value={ef.nombre} onChange={e=>setEf({...ef, nombre:e.target.value})}/>
            <input className="input" value={ef.email} onChange={e=>setEf({...ef, email:e.target.value})}/>
            <input className="input" type="password" placeholder="(opcional) nuevo password"
                   onChange={e=>setEf({...ef, password: e.target.value || (edit?.password ?? "")})}/>
            <input className="input" value={ef.nivel_acceso} onChange={e=>setEf({...ef, nivel_acceso: Number(e.target.value)})}/>
            <select className="input" value={ef.estado_cuenta} onChange={e=>setEf({...ef, estado_cuenta: e.target.value as Estado})}>
              <option value="activo">activo</option><option value="inactivo">inactivo</option>
            </select>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button className="btn-primary" onClick={()=> ef && updateMut.mutate(ef)}>Guardar</button>
              <button className="btn-danger" onClick={()=>setOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
