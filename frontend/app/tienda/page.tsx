//tienda/page
"use client";

import { useEffect, useState } from "react";
import {
  PlasmicRootProvider,
  PlasmicComponent,
} from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "@/lib/plasmic-init";
import { getJSON } from "@/lib/api";

// Tipo mínimo de lo que nos devuelve el backend para la tienda
type Tienda = {
  id: number;
  nombre_negocio: string;
  descripcion?: string | null;
  color_primario?: string | null;
  logo_url?: string | null;
  slug: string;
};

// Tipo mínimo del vendedor guardado en localStorage
type VendedorActual = {
  id: number;
  id_vendedor: number;
  nombre: string;
  email: string;
};

export default function TiendaPage() {
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [plasmicData, setPlasmicData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // 1) Leer el vendedor actual desde localStorage
        const raw = window.localStorage.getItem("vendedorActual");
        if (!raw) {
          throw new Error("No hay ningún vendedor autenticado.");
        }

        const vendedor: VendedorActual = JSON.parse(raw);
        if (!vendedor.id_vendedor) {
          throw new Error("El vendedor no tiene un id_vendedor válido.");
        }

        // 2) Pedir la tienda del backend usando el id_vendedor manual
        const tiendaBackend = await getJSON<Tienda>(
          `/tiendas/vendedor/${vendedor.id_vendedor}`
        );
        setTienda(tiendaBackend);

        // 3) Cargar los datos de Plasmic para el componente "tienda"
        const data = await PLASMIC.fetchComponentData("tienda");
        if (!data) {
          throw new Error("No se encontró el componente 'tienda' en Plasmic.");
        }
        setPlasmicData(data);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message ?? "No se pudo cargar la tienda desde el backend."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Cargando tienda...</div>;
  }

  if (error || !tienda || !plasmicData) {
    return (
      <div className="p-8 text-center text-red-600">
        {error ?? "No se pudo cargar la tienda desde el backend."}
      </div>
    );
  }

  // Si no hay logo, ponemos uno de relleno para evitar el warning del <img src="">
  const logoUrl =
    tienda.logo_url && tienda.logo_url.trim() !== ""
      ? tienda.logo_url
      : "https://via.placeholder.com/80x60?text=Logo";

  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
      <PlasmicComponent
        component="tienda"
        // 👇 Aquí van los props que creaste en Plasmic:
        componentProps={{
          tiendaNombre: tienda.nombre_negocio,
          tiendaDescripcion: tienda.descripcion ?? "",
          tiendaColorPrimario: tienda.color_primario ?? "#0080ff",
          tiendaLogoUrl: logoUrl,
        }}
      />
    </PlasmicRootProvider>
  );
}
