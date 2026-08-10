import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  align = "center",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 py-20 sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <div
            className={`mb-12 max-w-3xl ${
              align === "center" ? "mx-auto text-center" : ""
            }`}
          >
            {eyebrow && (
              <div className={`mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
