import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { uploadVideo, uploadThumbnail } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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
