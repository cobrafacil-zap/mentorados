import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  // Protege em produção
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Indisponível em produção" }, { status: 403 });
  }

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
}
