"use client";

import { useEffect, useState } from "react";
import {
  PlasmicRootProvider,
  PlasmicComponent,
} from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "@/lib/plasmic-init";
import { getJSON } from "@/lib/api";
import { useParams } from "next/navigation";

type Tienda = {
  id: number;
  vendedor_id: number;                 // PK
  vendedor_id_manual: string | number; // viene del backend ahora

  nombre_negocio: string;
  descripcion: string | null;
  color_primario: string | null;
  logo_url: string | null;
  slug: string;
};

const TIENDA_BY_SLUG_URL = (slug: string) => `/tiendas/${slug}`;

export default function TiendaPublicaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [plasmicData, setPlasmicData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const safeSlug = slug as string;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1. Traer tienda por slug
        const tiendaJson = await getJSON<Tienda>(
          TIENDA_BY_SLUG_URL(encodeURIComponent(safeSlug))
        );
        setTienda(tiendaJson);

        // 2. Traer diseño de Plasmic
        const plasmic = await PLASMIC.fetchComponentData("tienda");
        if (!plasmic) {
          throw new Error("No se encontró el componente 'tienda' en Plasmic.");
        }
        setPlasmicData(plasmic);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message ??
            "No se pudo cargar la tienda pública. Verifique el enlace."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  if (!slug) {
    return (
      <div className="p-8 text-center text-gray-600">
        Cargando información de la tienda...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">Cargando tienda...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-medium">{error}</div>
    );
  }

  if (!plasmicData || !tienda) return null;

  const logoUrl =
    tienda.logo_url && tienda.logo_url.trim() !== "" ? tienda.logo_url : null;

  // URL de productos usando el id manual del vendedor
  const tiendaProductosUrl =
    tienda?.vendedor_id_manual != null
      ? `/vendedores/${encodeURIComponent(
          String(tienda.vendedor_id_manual)
        )}/productos`
      : `/vendedores/${encodeURIComponent(
          String(tienda.vendedor_id)
        )}/productos`;

  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
      <PlasmicComponent
        component="tienda"
        componentProps={{
          tiendaNombre: tienda.nombre_negocio,
          tiendaDescripcion: tienda.descripcion ?? "",
          tiendaColorPrimario: tienda.color_primario ?? "#0080ff",
          tiendaLogoUrl: logoUrl,
          tiendaProductosUrl, // <- se envía al botón
        }}
      />
    </PlasmicRootProvider>
  );
}
