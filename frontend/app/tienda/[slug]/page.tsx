// app/tienda/[slug]/page.tsx
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
  vendedor_id: number;
  vendedor_id_manual: string | number;
  nombre_negocio: string;
  descripcion: string | null;
  color_primario: string | null;
  logo_url: string | null;
  slug: string;
};

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen_url?: string | null;
  destacado: boolean;
  vendedor_id: number;
};

const TIENDA_BY_SLUG_URL = (slug: string) => `/tiendas/${slug}`;

export default function TiendaPublicaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [plasmicData, setPlasmicData] = useState<any | null>(null);
  const [productosDestacados, setProductosDestacados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const safeSlug = String(slug);

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) Datos de la tienda
        const tiendaJson = await getJSON<Tienda>(
          TIENDA_BY_SLUG_URL(encodeURIComponent(safeSlug))
        );
        setTienda(tiendaJson);

        // 2) Productos de la tienda (NO del vendedor)
        const productos = await getJSON<Producto[]>(
          `/tiendas/${encodeURIComponent(safeSlug)}/productos`
        );

        // 3) Imágenes de productos destacados
        const imagenesDestacadas = productos
          .filter(
            (p) =>
              p.destacado === true &&
              typeof p.imagen_url === "string" &&
              p.imagen_url.trim() !== ""
          )
          .map((p) => p.imagen_url as string);

        setProductosDestacados(imagenesDestacadas);

        // 4) Datos de Plasmic
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
    typeof tienda.logo_url === "string" && tienda.logo_url.trim() !== ""
      ? tienda.logo_url
      : undefined;

  // URL pública para el botón de "ver productos" en Plasmic
  const tiendaProductosUrl = `/tienda/${tienda.slug}/productos`;

  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[1200px] px-4 pt-6">
          <PlasmicComponent
            component="tienda"
            componentProps={{
              tiendaNombre: tienda.nombre_negocio,
              tiendaDescripcion: tienda.descripcion ?? "",
              tiendaColorPrimario: tienda.color_primario ?? "#0080ff",
              tiendaLogoUrl: logoUrl,
              tiendaProductosUrl,
              productosDestacados,
            }}
          />
        </div>
      </div>
    </PlasmicRootProvider>
  );
}
