import { supabase } from "./supabaseClient";

export async function uploadProductImage(file: File, idVendedorManual: number) {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `vendedores/${idVendedorManual}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("productos")          // 👉 nombre del bucket en Supabase
    .upload(path, file);

  if (error) {
    console.error("Error subiendo imagen a Supabase:", error);
    throw error;
  }

  // Obtener URL pública
  const { data: publicData } = supabase.storage
    .from("productos")
    .getPublicUrl(path);

  return publicData.publicUrl;   // 👉 ESTA URL LA GUARDAMOS EN EL BACKEND
}
