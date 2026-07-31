import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ message: "Usuário já existe" });
    }

    await prisma.user.create({
      data: {
        email: "admin@metodogl.online",
        password: await hashPassword("admin123"),
        name: "Administrador",
      },
    });

    return NextResponse.json({
      message: "Usuário criado",
      email: "admin@metodogl.online",
      password: "admin123",
    });
  } catch (error) {
    console.error("Erro no seed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
