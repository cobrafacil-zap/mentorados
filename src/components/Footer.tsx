import Link from "next/link";
import { Logo } from "./Logo";
import { DEFAULT_CONTENT, type GlobalFooter as FooterData } from "@/lib/pageContent";

const FOOTER_DEFAULTS = DEFAULT_CONTENT.global_footer;

export function Footer(props: Partial<FooterData> = {}) {
  const {
    descriptionPrefix = FOOTER_DEFAULTS.descriptionPrefix,
    descriptionHighlight = FOOTER_DEFAULTS.descriptionHighlight,
    descriptionSuffix = FOOTER_DEFAULTS.descriptionSuffix,
    platformLinks = FOOTER_DEFAULTS.platformLinks,
    contatoLabel = FOOTER_DEFAULTS.contatoLabel,
    contatoEmail = FOOTER_DEFAULTS.contatoEmail,
    plataformaGratuitaLabel = FOOTER_DEFAULTS.plataformaGratuitaLabel,
    copyrightTagline = FOOTER_DEFAULTS.copyrightTagline,
  } = props;

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-[#04081a]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a18]/40 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            {descriptionPrefix}
            {descriptionHighlight && (
              <strong className="text-slate-200">{descriptionHighlight}</strong>
            )}{" "}
            {descriptionSuffix}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Plataforma
          </h4>
          <ul className="space-y-2 text-sm">
            {platformLinks.map((l) => (
              <li key={`${l.label}-${l.href}`}>
                <Link href={l.href} className="text-slate-400 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
            {contatoLabel}
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${contatoEmail}`} className="text-slate-400 hover:text-white">
                {contatoEmail}
              </a>
            </li>
            <li><span className="text-slate-500">{plataformaGratuitaLabel}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Método GL. Todos os direitos reservados.
          </p>
          <p className="text-slate-500">
            {copyrightTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
