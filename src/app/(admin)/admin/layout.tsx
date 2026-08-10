import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }

  if (!session) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}