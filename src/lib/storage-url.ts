/**
 * Converte URLs do Supabase Storage para URLs do Cloudflare R2.
 * Usado pra imagens ANTIGAS que ainda estão no banco com URL do Supabase.
 *
 * Supabase: https://xxx.supabase.co/storage/v1/object/public/mentorados/public/foo.webp
 * R2:       https://pub-xxxxx.r2.dev/public/foo.webp
 *
 * Se a URL já é do R2 ou não é do Supabase Storage, retorna a original.
 */
export function supabaseToR2(url: string | null | undefined): string {
  if (!url) return "";

  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!r2PublicUrl) return url;

  const supabaseBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mentorados/`;

  if (!url.startsWith(supabaseBaseUrl)) return url;

  const path = url.replace(supabaseBaseUrl, "");
  return `${r2PublicUrl}/${path}`;
}