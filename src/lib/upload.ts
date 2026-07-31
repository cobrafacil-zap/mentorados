import { getSupabaseAdmin } from "./supabase";

export async function uploadImage(file: File): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const bucketName = "mentorados";
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${extension}`;

  console.log("[UPLOAD] Enviando arquivo:", fileName, file.type, file.size);

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(`public/${fileName}`, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[UPLOAD] Erro do Supabase:", error);
    throw new Error(`Erro ao enviar imagem: ${error.message}`);
  }

  console.log("[UPLOAD] Sucesso, path:", data.path);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path);

  console.log("[UPLOAD] Public URL:", publicUrl);

  return publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const bucketName = "mentorados";
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;

  if (!url.startsWith(baseUrl)) return;

  const path = url.replace(baseUrl, "");

  await supabaseAdmin.storage.from(bucketName).remove([path]);
}
