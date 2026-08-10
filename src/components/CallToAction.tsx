import Link from "next/link";

export function CallToAction() {
  return (
    <section className="relative scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1640] via-[#0a1230] to-[#1a0e22] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#ff7a18]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#1d4ed8]/30 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
                100% gratuito · Sem cadastro
              </div>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Conheça o Método e comece a entender a sua operação de verdade.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                Aprenda a lógica por trás de grupos lucrativos, calcule o impacto
                da evasão e descubra quanto custa, de fato, cada pessoa que
                permanece na sua operação.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link href="#calculadora" className="btn-primary">
                COMEÇAR A APRENDER
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#aulas" className="btn-ghost">
                VER AULAS GRATUITAS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
