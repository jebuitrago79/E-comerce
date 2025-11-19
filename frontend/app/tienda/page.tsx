"use client";

import { useEffect, useState } from "react";
import {
  PlasmicRootProvider,
  PlasmicComponent,
} from "@plasmicapp/loader-nextjs";
import { PLASMIC } from "../../lib/plasmic-init";

export default function TiendaPage() {
  const [plasmicData, setPlasmicData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    PLASMIC.fetchComponentData("tienda")
      .then((data) => {
        if (!data) {
          setError("No se encontró la página 'tienda' en Plasmic.");
          return;
        }
        setPlasmicData(data);
      })
      .catch((err) => {
        console.error("Error cargando página de Plasmic:", err);
        setError("Ocurrió un error cargando la tienda.");
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!plasmicData) {
    return <div>Cargando tienda...</div>;
  }

  return (
    <PlasmicRootProvider loader={PLASMIC} prefetchedData={plasmicData}>
      <PlasmicComponent component="tienda" />
    </PlasmicRootProvider>
  );
}
