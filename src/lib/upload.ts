import { getSupabaseAdmin } from "./supabase";

const BUCKET = "mentorados";
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10 MB

const VIDEO_MIME_ALLOW = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
]);
const IMAGE_MIME_ALLOW = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function randomSuffix() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";
  return "bin";
}

function pathFromUrl(url: string, folder: string): string | null {
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(baseUrl)) return null;
  const path = url.replace(baseUrl, "");
  // Só permite deletar dentro da pasta segura
  if (!path.startsWith(folder)) return null;
  return path;
}

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_MIME_ALLOW.has(file.type)) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Imagem maior que ${MAX_IMAGE_BYTES / 1024 / 1024}MB`);
  }
  return uploadFile(file, "public", file.type);
}

export async function uploadVideo(file: File): Promise<string> {
  if (!VIDEO_MIME_ALLOW.has(file.type)) {
    throw new Error(`Tipo de vídeo não suportado: ${file.type}`);
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`Vídeo maior que ${MAX_VIDEO_BYTES / 1024 / 1024}MB`);
  }
  return uploadFile(file, "videos", file.type);
}

export async function uploadThumbnail(file: File): Promise<string> {
  if (!IMAGE_MIME_ALLOW.has(file.type)) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Imagem maior que ${MAX_IMAGE_BYTES / 1024 / 1024}MB`);
  }
  return uploadFile(file, "thumbnails", file.type);
}

async function uploadFile(
  file: File,
  folder: string,
  contentType: string
): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();
  const ext = getExtension(file);
  const fileName = `${randomSuffix()}.${ext}`;
  const path = `${folder}/${fileName}`;

  console.log(`[UPLOAD] Enviando ${path} (${file.size} bytes, ${contentType})`);

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("[UPLOAD] Erro do Supabase:", error);
    throw new Error(`Erro ao enviar arquivo: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const path = pathFromUrl(url, "public") ?? pathFromUrl(url, "thumbnails");
  if (!path) return;
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.storage.from(BUCKET).remove([path]);
}

export async function deleteVideo(url: string): Promise<void> {
  const path = pathFromUrl(url, "videos");
  if (!path) return;
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.storage.from(BUCKET).remove([path]);
}

export const uploadLimits = {
  maxVideoBytes: MAX_VIDEO_BYTES,
  maxImageBytes: MAX_IMAGE_BYTES,
  videoMimeAllow: Array.from(VIDEO_MIME_ALLOW),
  imageMimeAllow: Array.from(IMAGE_MIME_ALLOW),
};
