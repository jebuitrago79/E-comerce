// frontend/components/ProductList.tsx
"use client";

import useSWR from "swr";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductList() {
  const { data, error, isLoading } = useSWR(`${API}/productos`, fetcher);

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar productos</p>;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {data?.map((p: any) => (
        <div key={p.id} className="p-4 border rounded-lg shadow-sm">
          <h3 className="font-semibold">{p.nombre}</h3>
          <p className="text-sm text-gray-500">{p.descripcion}</p>
          <p className="font-bold mt-2">${p.precio}</p>
        </div>
      ))}
    </div>
  );
}
