import { supabase } from "./supabaseClient";

export async function uploadLogoImage(file: File, tiendaSlug: string) {
  const fileName = `${Date.now()}-${file.name}`;
  const path = `tiendas/${tiendaSlug}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("tiendas")              // 👈 bucket para logos
    .upload(path, file);

  if (error) {
    console.error("Error subiendo logo a Supabase:", error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from("tiendas")
    .getPublicUrl(path);

  return publicData.publicUrl;   // 👈 ESTA URL la guardas en tu backend
}
