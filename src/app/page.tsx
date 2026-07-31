import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold">Painel de Mentorados</h1>
        <p className="text-lg text-gray-300">
          Gerencie seus mentorados e suas páginas de captura individuais.
        </p>
        <Link
          href="/admin"
          className="inline-block rounded-full bg-red-600 px-8 py-3 text-lg font-medium transition hover:bg-red-700"
        >
          Acessar painel administrativo
        </Link>
      </div>
    </div>
  );
}
