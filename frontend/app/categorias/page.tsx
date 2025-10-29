"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, getJSON, postJSON, putJSON } from "@/lib/api";
import type { Categoria } from "@/lib/types";
import { useMemo, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

export default function CategoriasPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data } = useQuery({
    queryKey: ["categorias", page, pageSize],
    queryFn: () => getJSON<Categoria[]>(`/categorias/?limit=${pageSize}&offset=${offset}`),
  });

  const [f, setF] = useState({ slug: "", nombre: "", descripcion: "" });
  const [msg, setMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (p:any) => postJSON<Categoria>("/categorias/", p),
    onSuccess: () => { setMsg("✅ Categoría creada"); setF({ slug:"", nombre:"", descripcion:"" }); qc.invalidateQueries({ queryKey: ["categorias"]}); },
    onError: (e:any) => setMsg(`❌ ${e?.response?.data?.detail ?? e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id:number) => del(`/categorias/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });

  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const filtered = useMemo(()=>{
    if(!q) return data ?? [];
    const s = q.toLowerCase();
    return (data ?? []).filter(c => [c.slug, c.nombre, c.descripcion].some(x => (x??"").toLowerCase().includes(s)));
  },[q, data]);

  // editar
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Categoria | null>(null);
  const [ef, setEf] = useState<Categoria | null>(null);
  const openEdit = (c:Categoria) => { setEdit(c); setEf({...c}); setOpen(true); };

  const updateMut = useMutation({
    mutationFn: (c:Categoria) => putJSON<Categoria>(`/categorias/${c.id}`, {
      slug: c.slug, nombre: c.nombre, descripcion: c.descripcion ?? null
    }),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["categorias"]}); },
  });

  const handleCreate = async () => {
    setMsg(null);
    if(!f.slug || !f.nombre) return setMsg("❌ slug y nombre son obligatorios.");
    await createMut.mutateAsync({ slug: f.slug.trim().toLowerCase(), nombre: f.nombre.trim(), descripcion: f.descripcion || null });
  };

  return (
    <section>
      <h1 className="text-3xl font-bold">Categorías</h1>
      <ul className="list-disc pl-6 text-sm text-slate-600 mb-6">
        <li><b>slug</b>: identificador sin espacios, minúsculas (ej: <i>zapatos-hombre</i>).</li>
        <li><b>nombre</b>: cómo se mostrará al usuario.</li>
        <li><b>descripción</b> (opcional): texto informativo.</li>
      </ul>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-sm mb-1">slug</label>
            <input className="input" value={f.slug} onChange={e=>setF(s=>({...s,slug:e.target.value}))}/></div>
          <div><label className="block text-sm mb-1">nombre</label>
            <input className="input" value={f.nombre} onChange={e=>setF(s=>({...s,nombre:e.target.value}))}/></div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">descripción (opcional)</label>
          <textarea className="input min-h-[80px]" value={f.descripcion} onChange={e=>setF(s=>({...s,descripcion:e.target.value}))}/>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="btn-primary" onClick={handleCreate}>Crear</button>
          {msg && <span className="text-sm">{msg}</span>}
          <div className="ml-auto">
            <input className="input" placeholder="Buscar categoría…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <ul className="divide-y">
          {filtered.map(cat=>(
            <li key={cat.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{cat.nombre}</div>
                <div className="text-xs text-slate-600">slug: {cat.slug}</div>
                {cat.descripcion && <div className="text-sm">{cat.descripcion}</div>}
              </div>
              <div className="flex gap-2">
                <button className="btn-primary !px-3" onClick={()=>openEdit(cat)}>Editar</button>
                <button className="btn-danger" onClick={()=>deleteMut.mutate(cat.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
        <Pagination page={page} pageSize={pageSize} onPage={setPage}/>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={`Editar categoría #${edit?.id}`}>
        {ef && (
          <div className="grid gap-3">
            <input className="input" value={ef.slug} onChange={e=>setEf({...ef, slug:e.target.value})}/>
            <input className="input" value={ef.nombre} onChange={e=>setEf({...ef, nombre:e.target.value})}/>
            <textarea className="input min-h-[80px]" value={ef.descripcion ?? ""} onChange={e=>setEf({...ef, descripcion:e.target.value})}/>
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

