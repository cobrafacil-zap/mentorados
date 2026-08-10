import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { uploadVideo, uploadThumbnail } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const kind = formData.get("kind")?.toString() ?? "video";
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const url = kind === "thumbnail" ? await uploadThumbnail(file) : await uploadVideo(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[ADMIN VIDEOS UPLOAD] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no upload" },
      { status: 500 }
    );
  }
}
