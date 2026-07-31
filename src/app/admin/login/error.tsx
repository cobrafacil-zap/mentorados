"use client";

export default function LoginError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="rounded-lg border border-red-800 bg-red-950/30 p-6 text-center">
        <h1 className="text-xl font-bold text-red-200">Erro ao carregar login</h1>
        <p className="mt-2 text-sm text-red-300">
          Não foi possível carregar a página de login. Verifique se as variáveis de ambiente do NextAuth estão configuradas corretamente.
        </p>
      </div>
    </div>
  );
}
