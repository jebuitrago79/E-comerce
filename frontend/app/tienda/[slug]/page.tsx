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
  vendedor_id_manual: string | number | null;
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

// 🔹 tipo que Plasmic va a recibir en productosDestacados
type DestacadoImage = {
  src: string;
};

const TIENDA_BY_SLUG_URL = (slug: string) => `/tiendas/${slug}`;

export default function TiendaPublicaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [plasmicData, setPlasmicData] = useState<any | null>(null);

  // 👉 ahora es array de objetos { src }
  const [productosDestacados, setProductosDestacados] = useState<
    DestacadoImage[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) Datos de la tienda
        const tiendaJson = await getJSON<Tienda>(
          TIENDA_BY_SLUG_URL(encodeURIComponent(String(slug)))
        );
        setTienda(tiendaJson);

        // 2) Determinar id para productos (manual o normal)
        const vendedorKey =
          tiendaJson.vendedor_id_manual ?? tiendaJson.vendedor_id;

        // 3) Productos del vendedor
        const productos = await getJSON<Producto[]>(
          `/vendedores/${encodeURIComponent(String(vendedorKey))}/productos`
        );

        // 4) Filtrar destacados con imagen válida y mapear a { src }
        const imagenes: DestacadoImage[] = productos
          .filter(
            (p) =>
              p.destacado === true &&
              typeof p.imagen_url === "string" &&
              p.imagen_url.trim() !== ""
          )
          .map((p) => ({
            src: p.imagen_url!.trim(),
          }));

        setProductosDestacados(imagenes);

        // 5) Cargar Plasmic
        const plasmic = await PLASMIC.fetchComponentData("tienda");
        setPlasmicData(plasmic);
      } catch (err: any) {
        console.error(err);
        setError("Error cargando la tienda.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  // ---- estados de carga / error ----
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

  // Logo seguro: string o undefined (NO vacío)
  const logoUrl =
    typeof tienda.logo_url === "string" && tienda.logo_url.trim() !== ""
      ? tienda.logo_url.trim()
      : undefined;

  // URL para ver todos los productos
  const tiendaProductosUrl = `/vendedores/${encodeURIComponent(
    String(tienda.vendedor_id_manual ?? tienda.vendedor_id)
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
          tiendaProductosUrl,
          // 👇 ahora es SIEMPRE un array de objetos { src }
          productosDestacados,
        }}
      />
    </PlasmicRootProvider>
  );
}
