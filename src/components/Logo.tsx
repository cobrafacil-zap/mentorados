// Logo SVG do Método GL
// GL em caixão/azulejo com detalhe laranja — leve, escalável, sem dependência externa.
export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 56 56"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gl-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0a1230" />
          </linearGradient>
          <linearGradient id="gl-orange" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a2a" />
            <stop offset="100%" stopColor="#ff5a00" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="52" height="52" rx="14" fill="url(#gl-grad)" stroke="rgba(99,130,200,0.4)" strokeWidth="1" />
        <path
          d="M16 18 L16 38 L20 38 L20 26 L26 38 L30 38 L36 26 L36 38 L40 38 L40 18 L36 18 L28 32 L20 18 Z"
          fill="#ffffff"
        />
        <circle cx="44" cy="14" r="3.5" fill="url(#gl-orange)" />
      </svg>
      <div className="leading-tight">
        <div className="text-base font-semibold tracking-tight text-white">Método GL</div>
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#ff7a18]">
          Grupos Lucrativos
        </div>
      </div>
    </div>
  );
}
