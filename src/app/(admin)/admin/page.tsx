import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Mentorado } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const mentorados: Mentorado[] = await prisma.mentorado.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mentorados</h2>
        <Link
          href="/admin/mentorados/novo"
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Novo mentorado
        </Link>
      </div>

      {mentorados.length === 0 ? (
        <p className="text-zinc-400">Nenhum mentorado cadastrado ainda.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-300">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug / Subdomínio</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pixel</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {mentorados.map((m) => (
                <tr key={m.id} className="bg-zinc-950 hover:bg-zinc-900">
                  <td className="px-4 py-3 font-medium">{m.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {m.slug}.metodogl.site
                  </td>
                  <td className="px-4 py-3">
                    {m.ativo ? (
                      <span className="rounded bg-green-900/50 px-2 py-1 text-xs text-green-300">
                        Ativo
                      </span>
                    ) : (
                      <span className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-300">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{m.pixelId || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/mentorados/${m.id}`}
                      className="rounded bg-zinc-800 px-3 py-1 text-xs text-white hover:bg-zinc-700"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
