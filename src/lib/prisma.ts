import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Falha ruidosa em dev/prod — fica óbvio que falta configurar.
    throw new Error(
      "DATABASE_URL não está definida. Copie .env.example para .env e preencha com a connection string do Supabase.",
    );
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
