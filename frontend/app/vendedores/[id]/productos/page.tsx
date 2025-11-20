// app/vendedores/[id]/productos/page.tsx
import ProductosPorVendedor from "./ProductosPorVendedor";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 👇 Desempaquetar el Promise que trae los params
  const { id } = await params;

  const vendedorId = Number(id);

  // (Opcional) Si quieres log de depuración:
  // console.log("ID de vendedor desde la URL:", id, "->", vendedorId);

  return <ProductosPorVendedor vendedorId={vendedorId} />;
}
