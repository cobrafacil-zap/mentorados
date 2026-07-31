"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TesteLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result?.error || "Email ou senha inválidos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4"
      style={{ color: "white" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg border border-zinc-700 bg-zinc-900 p-8"
      >
        <h1 className="text-2xl font-bold"
          style={{ color: "white" }}
        >Acessar painel</h1>

        {error ? (
          <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-200"
            style={{ color: "#fecaca" }}
          >{error}</div>
        ) : null}

        <div className="space-y-2"
          style={{ color: "#d4d4d4" }}
        >
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            style={{ color: "white", background: "#09090b" }}
          />
        </div>

        <div className="space-y-2"
          style={{ color: "#d4d4d4" }}
        >
          <label htmlFor="password" className="block text-sm font-medium">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-4 py-2 text-white"
            style={{ color: "white", background: "#09090b" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-red-600 px-4 py-2 font-medium text-white"
          style={{ color: "white", background: "#dc2626" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
