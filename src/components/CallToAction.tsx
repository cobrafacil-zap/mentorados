import Link from "next/link";

export function CallToAction() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1640] via-[#0a1230] to-[#1a0e22] p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#ff7a18]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#1d4ed8]/25 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                Pronto para entender a sua operação de verdade?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Comece pelo vídeo introdutório e, em seguida, simule os números
                do seu grupo na calculadora.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:items-center">
              <Link href="/aulas" className="btn-primary">
                COMEÇAR A APRENDER
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/ferramentas" className="btn-ghost">
                ABRIR A CALCULADORA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}