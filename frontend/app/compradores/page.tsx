"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Comprador } from "@/lib/types";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import useDebounce from "@/hooks/useDebounce";

export default function CompradoresPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data } = useQuery({
    queryKey: ["compradores", page, pageSize],
    queryFn: () => getJSON<Comprador[]>(`/compradores/?limit=${pageSize}&offset=${offset}`),
  });

  const [f, setF] = useState({ nombre: "", email: "", password: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (p: any) => postJSON<Comprador>("/compradores/", p),
    onSuccess: () => { setMsg("✅ Comprador creado"); setF({ nombre:"", email:"", password:"" }); qc.invalidateQueries({ queryKey: ["compradores"] }); },
    onError: (e:any)=> setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => del(`/compradores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compradores"] }),
  });

  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const filtered = useMemo(()=> {
    if(!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter(c => [c.nombre,c.email].some(x => (x??"").toLowerCase().includes(s)));
  }, [q, data]);

  // Editar
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Comprador | null>(null);
  const [ef, setEf] = useState<Comprador | null>(null);
  const openEdit = (c: Comprador) => { setEdit(c); setEf({...c}); setOpen(true); };

  const updateMut = useMutation({
    mutationFn: (c: Comprador) => putJSON<Comprador>(`/compradores/${c.id}`, {
      nombre: c.nombre, email: c.email, password: c.password
    }),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["compradores"] }); },
  });

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Compradores</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6 grid gap-4 md:grid-cols-3">
        <input className="input" placeholder="Nombre" value={f.nombre} onChange={e=>setF(s=>({...s,nombre:e.target.value}))}/>
        <input className="input" placeholder="Correo" value={f.email} onChange={e=>setF(s=>({...s,email:e.target.value}))}/>
        <input className="input" type="password" placeholder="Password" value={f.password} onChange={e=>setF(s=>({...s,password:e.target.value}))}/>
        <div className="md:col-span-3">
          <button className="btn-primary" onClick={()=>createMut.mutate(f)}>Crear</button>
          {msg && <span className="ml-3 text-sm">{msg}</span>}
        </div>
      </div>

      <div className="mb-3">
        <input className="input max-w-sm" placeholder="Buscar por nombre o correo…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="th">ID</th><th className="th">Nombre</th><th className="th">Correo</th><th className="th text-right">Acciones</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} className="border-t">
                <td className="td">{c.id}</td>
                <td className="td">{c.nombre}</td>
                <td className="td">{c.email}</td>
                <td className="td text-right flex justify-end gap-2">
                  <button className="btn-primary !px-3" onClick={()=>openEdit(c)}>Editar</button>
                  <button className="btn-danger" onClick={()=>deleteMut.mutate(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} onPage={setPage}/>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={`Editar comprador #${edit?.id}`}>
        {ef && (
          <div className="grid gap-3">
            <input className="input" value={ef.nombre} onChange={e=>setEf({...ef, nombre:e.target.value})}/>
            <input className="input" value={ef.email} onChange={e=>setEf({...ef, email:e.target.value})}/>
            <input className="input" type="password" placeholder="(opcional) nuevo password"
                   onChange={e=>setEf({...ef, password: e.target.value || (edit?.password ?? "")})}/>
            <div className="flex justify-end gap-2">
              <button className="btn-primary" onClick={()=> ef && updateMut.mutate(ef)}>Guardar</button>
              <button className="btn-danger" onClick={()=>setOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
