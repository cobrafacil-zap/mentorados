import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-[#04081a]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a18]/40 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            <strong className="text-slate-200">Método de Grupos Lucrativos.</strong>{" "}
            Conteúdo gratuito para quem quer aprender a construir e analisar
            operações de grupos com tráfego pago.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Plataforma
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#metodo" className="text-slate-400 hover:text-white">Método GL</Link></li>
            <li><Link href="#aulas" className="text-slate-400 hover:text-white">Aulas</Link></li>
            <li><Link href="#ferramentas" className="text-slate-400 hover:text-white">Ferramentas</Link></li>
            <li><Link href="#metricas" className="text-slate-400 hover:text-white">Métricas</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Contato
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:contato@metodogl.online" className="text-slate-400 hover:text-white">contato@metodogl.online</a></li>
            <li><span className="text-slate-500">Plataforma 100% gratuita</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Método GL. Todos os direitos reservados.
          </p>
          <p className="text-slate-500">
            Conteúdo educacional. Resultados dependem de operação, mercado e execução.
          </p>
        </div>
      </div>
    </footer>
  );
}
