import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { Logo } from "@/components/Logo";

export function AdminHeader({ active }: { active?: "mentorados" | "videos" | "dashboard" }) {
  const linkBase = "rounded-md px-3 py-1.5 text-sm font-medium transition";
  const inactive = `${linkBase} text-zinc-300 hover:bg-white/5 hover:text-white`;
  const isActive = (key: NonNullable<typeof active>) =>
    active === key
      ? `${linkBase} bg-white/10 text-white`
      : inactive;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" aria-label="Painel">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Seções do painel">
            <Link href="/admin" className={isActive("dashboard")}>
              Mentorados
            </Link>
            <Link href="/admin/videos" className={isActive("videos")}>
              Vídeos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden text-xs text-zinc-400 hover:text-white sm:inline" target="_blank">
            Ver site ↗
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
