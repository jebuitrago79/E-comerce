"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { errorToText } from "@/lib/httpError";

type Admin = {
  id: number;
  nombre: string;
  email: string;
  nivel_acceso: string;
  estado_cuenta: "activo" | "bloqueado";
  id_admin: number;
};

export default function AdministradoresPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = React.useState<string | null>(null);
  const [f, setF] = React.useState({
    nombre: "", email: "", password: "",
    id_admin: "", nivel_acceso: "",
    estado_cuenta: "activo" as "activo" | "bloqueado",
  });

  const admins = useQuery({
    queryKey: ["administradores"],
    queryFn: async () => (await api.get<Admin[]>("/administradores")).data,
  });

  const crear = useMutation({
    mutationFn: async () => {
      setMsg(null);
      if (!f.nombre || !f.email || !f.password || !f.id_admin || !f.nivel_acceso) {
        throw new Error("Completa nombre, email, password, id_admin y nivel_acceso.");
      }
      const payload = {
        nombre: f.nombre.trim(),
        email: f.email.trim(),
        password: f.password,
        id_admin: Number(f.id_admin),
        nivel_acceso: f.nivel_acceso.trim(),
        estado_cuenta: f.estado_cuenta,
      };
      return (await api.post("/administradores", payload)).data;
    },
    onSuccess: () => {
      setMsg("✅ Administrador creado");
      setF({ nombre:"", email:"", password:"", id_admin:"", nivel_acceso:"", estado_cuenta:"activo" });
      qc.invalidateQueries({ queryKey: ["administradores"] });
    },
    onError: (e) => setMsg(`❌ ${errorToText(e)}`),
  });

  const eliminar = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/administradores/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["administradores"] }),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Administradores</h1>

      <div className="bg-white/5 p-4 rounded-lg flex flex-wrap gap-2">
        <input placeholder="Nombre" value={f.nombre} onChange={(e)=>setF({...f, nombre:e.target.value})}/>
        <input placeholder="Email" value={f.email} onChange={(e)=>setF({...f, email:e.target.value})}/>
        <input placeholder="Password" type="password" value={f.password} onChange={(e)=>setF({...f, password:e.target.value})}/>
        <input placeholder="ID Admin (número)" value={f.id_admin} onChange={(e)=>setF({...f, id_admin:e.target.value})}/>
        <input placeholder="Nivel de Acceso" value={f.nivel_acceso} onChange={(e)=>setF({...f, nivel_acceso:e.target.value})}/>
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
              <th className="text-left p-2">Nivel</th>
              <th className="text-left p-2">Estado</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {admins.data?.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.nombre}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.nivel_acceso}</td>
                <td className="p-2">{a.estado_cuenta}</td>
                <td className="p-2">
                  <button className="text-red-500" onClick={()=>eliminar.mutate(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


