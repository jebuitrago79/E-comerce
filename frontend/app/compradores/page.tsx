"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { errorToText } from "@/lib/httpError";

type Comprador = {
  id: number;
  nombre: string;
  email: string;
  direccion: string | null;
  telefono: string | null;
  estado_cuenta: "activo" | "bloqueado";
  id_comprador: number;
};

export default function CompradoresPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [f, setF] = React.useState({
    nombre: "", email: "", password: "",
    id_comprador: "", direccion: "", telefono: "",
    estado_cuenta: "activo" as "activo" | "bloqueado",
  });

  const compradores = useQuery({
    queryKey: ["compradores"],
    queryFn: async () => (await api.get<Comprador[]>("/compradores")).data,
  });

  const crear = useMutation({
    mutationFn: async () => {
      setMsg(null);
      if (!f.nombre || !f.email || !f.password || !f.id_comprador) {
        throw new Error("Completa nombre, email, password e ID comprador.");
      }
      const payload = {
        nombre: f.nombre.trim(),
        email: f.email.trim(),
        password: f.password,
        id_comprador: Number(f.id_comprador),
        direccion: f.direccion.trim() || null,
        telefono: f.telefono.trim() || null,
        estado_cuenta: f.estado_cuenta,
      };
      return (await api.post("/compradores", payload)).data;
    },
    onSuccess: () => {
      setMsg("✅ Comprador creado");
      setF({ nombre:"", email:"", password:"", id_comprador:"", direccion:"", telefono:"", estado_cuenta:"activo" });
      qc.invalidateQueries({ queryKey: ["compradores"] });
    },
    onError: (e) => setMsg(`❌ ${errorToText(e)}`),
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/compradores/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compradores"] }),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Compradores</h1>

      <div className="bg-white/5 p-4 rounded-lg flex flex-wrap gap-2">
        <input placeholder="Nombre" value={f.nombre} onChange={(e)=>setF({...f, nombre:e.target.value})}/>
        <input placeholder="Email" value={f.email} onChange={(e)=>setF({...f, email:e.target.value})}/>
        <input placeholder="Password" type="password" value={f.password} onChange={(e)=>setF({...f, password:e.target.value})}/>
        <input placeholder="ID Comprador (número)" value={f.id_comprador} onChange={(e)=>setF({...f, id_comprador:e.target.value})}/>
        <input placeholder="Dirección" value={f.direccion} onChange={(e)=>setF({...f, direccion:e.target.value})}/>
        <input placeholder="Teléfono" value={f.telefono} onChange={(e)=>setF({...f, telefono:e.target.value})}/>
        <select value={f.estado_cuenta} onChange={(e)=>setF({...f, estado_cuenta: e.target.value as any})}>
          <option value="activo">activo</option>
          <option value="bloqueado">bloqueado</option>
        </select>
        <button onClick={()=>crear.mutate()} disabled={crear.isPending}>Crear</button>
        {msg && <p className="w-full mt-2">{msg}</p>}
      </div>

      <div className="overflow-x-auto bg-white/5 rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Correo</th>
              <th className="text-left p-2">Dirección</th>
              <th className="text-left p-2">Teléfono</th>
              <th className="text-left p-2">Estado</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {compradores.data?.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.nombre}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.direccion}</td>
                <td className="p-2">{c.telefono}</td>
                <td className="p-2">{c.estado_cuenta}</td>
                <td className="p-2">
                  <button className="text-red-500" onClick={()=>eliminar.mutate(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
