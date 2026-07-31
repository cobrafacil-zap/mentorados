import { getSupabaseAdmin } from "./supabase";

export async function uploadImage(file: File): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const bucketName = "mentorados";
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${extension}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(`public/${fileName}`, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path);

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
