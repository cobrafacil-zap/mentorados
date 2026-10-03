"use client";

import { useCallback, useEffect, useRef, useState, Children, Fragment } from "react";
import { MetaPixel, MetaPixelNoScript } from "./MetaPixel";
import { StorageImage } from "./StorageImage";
import { supabaseToR2 } from "@/lib/storage-url";
import type { AchadosConfig } from "@/lib/templates";

interface MentoradoBase {
  nome: string;
  linkCta: string;
  pixelId: string | null;
  imagemUrl: string | null;
}

interface LandingAchadosProps {
  mentorado: MentoradoBase;
  config: AchadosConfig;
}

/* ---------- Carrossel genérico (scroll-snap + dots + autoplay) ---------- */

function Carousel({
  id,
  count,
  children,
  cardMin,
}: {
  id: string;
  count: number;
  children: React.ReactNode;
  cardMin: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | null>(null);

  // Itens triplicados (clone | real | clone), igual à referência:
  // permite o loop infinito sem "pulo" visível.
  const items = Children.toArray(children);
  const tripled = [0, 1, 2].flatMap((copy) =>
    items.map((child, i) => <Fragment key={`${copy}-${i}`}>{child}</Fragment>)
  );

  const centerCard = useCallback((el: HTMLElement, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: el.offsetLeft - track.clientWidth / 2 + el.clientWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return -1;
    const cards = track.querySelectorAll("[data-card]");
    if (!cards.length) return -1;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((el, i) => {
      const h = el as HTMLElement;
      const c = h.offsetLeft + h.clientWidth / 2;
      const dist = Math.abs(c - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, []);

  // Começa no bloco do meio (o "real")
  useEffect(() => {
    if (count <= 1) return;
    const track = trackRef.current;
    if (!track) return;
    const t = setTimeout(() => {
      const cards = track.querySelectorAll("[data-card]");
      const el = cards[count] as HTMLElement | undefined;
      if (el) centerCard(el, false);
    }, 50);
    return () => clearTimeout(t);
  }, [count, centerCard]);

  // Scroll: atualiza dots + reposiciona silenciosamente nas bordas (loop).
  // Só atua quando o conteúdo realmente transborda a tela.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;
    const hasOverflow = () => track.scrollWidth > track.clientWidth + 10;
    const onScroll = () => {
      if (!hasOverflow()) return;
      const total = track.scrollWidth;
      const setW = total / 3;
      if (track.scrollLeft < setW * 0.25) {
        track.scrollLeft += setW;
        return;
      }
      if (track.scrollLeft + track.clientWidth > total - setW * 0.25) {
        track.scrollLeft -= setW;
        return;
      }
      const best = nearestIndex();
      if (best >= 0) setActive(best % count);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [count, nearestIndex]);

  // Autoplay que pausa quando o usuário interage (só com overflow real)
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      const track = trackRef.current;
      if (!track || track.scrollWidth <= track.clientWidth + 10) return;
      const best = nearestIndex();
      if (best < 0) return;
      const cards = track.querySelectorAll("[data-card]");
      const el = (cards[best + 1] ?? cards[count]) as HTMLElement | undefined;
      if (el) centerCard(el, true);
    }, 3500);
    return () => clearInterval(timer);
  }, [count, nearestIndex, centerCard]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    []
  );

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, 5000);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      pause();
      const track = trackRef.current;
      if (!track) return;
      const cards = track.querySelectorAll("[data-card]");
      const el = cards[count + index] as HTMLElement | undefined;
      if (el) centerCard(el, true);
      setActive(index);
    },
    [count, centerCard, pause]
  );

  if (count === 0) return null;

  return (
    <div>
      <div
        ref={trackRef}
        className="t2-track"
        style={{ ["--t2-card" as string]: cardMin }}
        onPointerDown={pause}
        onWheel={pause}
        onMouseEnter={pause}
      >
        {tripled}
      </div>
      <div className="t2-dots" role="tablist" aria-label={id}>
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`t2-dot${i === active ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function PlaceholderCard({ label, emoji, tall }: { label: string; emoji: string; tall?: boolean }) {
  return (
    <div data-card className={`t2-ph${tall ? " tall" : ""}`}>
      <span className="t2-ph-emoji">{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

/* ---------- Página ---------- */

export function LandingAchados({ mentorado, config }: LandingAchadosProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [copied, setCopied] = useState(false);

  const openOverlay = useCallback(() => {
    setCountdown(3);
    setCopied(false);
    setOverlayOpen(true);
  }, []);

  useEffect(() => {
    if (!overlayOpen) return;
    if (countdown <= 0) {
      const done = setTimeout(() => {
        window.open(mentorado.linkCta, "_blank", "noopener");
        setOverlayOpen(false);
      }, 400);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [overlayOpen, countdown, mentorado.linkCta]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mentorado.linkCta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [mentorado.linkCta]);

  const heroLogo = supabaseToR2(config.heroLogoUrl) || supabaseToR2(mentorado.imagemUrl);

  return (
    <>
      <MetaPixel pixelId={mentorado.pixelId} />
      <MetaPixelNoScript pixelId={mentorado.pixelId} />

      <div
        className="t2-root"
        style={
          {
            "--t2-hero": config.corHeroBg,
            "--t2-hero-title": config.corHeroTitulo,
            "--t2-hero-sub": config.corHeroSub,
            "--t2-primary": config.corPrimaria,
            "--t2-cta": config.corCta,
            "--t2-cta-hover": config.corCtaHover,
            "--t2-cta-text": config.corCtaTexto,
            "--t2-bg": config.corFundo,
            "--t2-cupons": config.corSessaoCupons,
            "--t2-final1": config.corFinalBg1,
            "--t2-final2": config.corFinalBg2,
            "--t2-footer": config.corRodapeBg,
            "--t2-footer-hi": config.corRodapeDestaque,
          } as React.CSSProperties
        }
      >
        <style>{`
          .t2-root{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--t2-bg);color:#1a1a1a;margin:0;padding:0;min-height:100vh}
          .t2-root *{box-sizing:border-box;margin:0;padding:0}
          .t2-hero{background:var(--t2-hero);padding:14px 20px 18px;text-align:center;position:relative;overflow:hidden}
          .t2-hero:before{content:"";position:absolute;top:-60px;right:-60px;width:220px;height:220px;background:#ffffff47;border-radius:50%;pointer-events:none}
          .t2-hero:after{content:"";position:absolute;bottom:-80px;left:-40px;width:280px;height:280px;background:#00000010;border-radius:50%;pointer-events:none}
          .t2-badge{display:inline-block;background:#00000014;border:1.5px solid #00000020;color:var(--t2-primary);font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:5px 14px;border-radius:50px;margin-bottom:14px;position:relative;z-index:1}
          .t2-hero h1{font-size:23px;font-weight:900;color:var(--t2-hero-title);text-shadow:0 2px 10px rgba(0,0,0,.25);line-height:1.25;margin-bottom:6px;position:relative;z-index:1}
          .t2-hero-logo{display:block;max-height:28px;width:auto;margin:6px auto}
          .t2-hero-logo-fallback{display:block;font-size:22px;font-weight:900;letter-spacing:.04em;color:var(--t2-primary);margin:4px 0}
          .t2-hero p.t2-sub{font-size:13.5px;color:var(--t2-hero-sub);opacity:.75;line-height:1.45;max-width:340px;margin:0 auto 10px;position:relative;z-index:1}
          .t2-track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:6px 24px 10px}
          .t2-track img{pointer-events:none;user-select:none;-webkit-user-select:none}
          .t2-track::-webkit-scrollbar{display:none}
          .t2-track [data-card]{scroll-snap-align:center;flex:0 0 var(--t2-card,178px)}
          .t2-card{border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12);border:1.5px solid #161616;background:#161616;aspect-ratio:7/10;max-width:178px;width:100%}
          .t2-card img{width:100%;height:100%;object-fit:cover;display:block}
          .t2-card-cupom{border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);border:1.5px solid #f0e8df;background:#fff;aspect-ratio:5/2;max-width:290px;width:100%}
          .t2-card-cupom img{width:100%;height:100%;object-fit:contain;display:block}
          .t2-card-prova{border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.15);border:1.5px solid #e0e0e0;background:#111;aspect-ratio:9/16;max-width:240px;width:100%}
          .t2-card-prova img{width:100%;height:100%;object-fit:cover;display:block}
          .t2-ph{border-radius:16px;border:2px dashed #00000025;background:#ffffff80;min-height:220px;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#00000070;padding:16px;text-align:center;max-width:178px;width:100%}
          .t2-ph.tall{min-height:300px;max-width:240px}
          .t2-ph-emoji{font-size:34px}
          .t2-dots{display:flex;justify-content:center;gap:6px;margin-top:8px;position:relative;z-index:1}
          .t2-dot{width:8px;height:8px;border-radius:50%;background:#00000022;transition:all .3s ease;cursor:pointer;border:none;padding:0}
          .t2-dot.active{background:var(--t2-primary);width:24px;border-radius:4px}
          .t2-cta{display:block;background:var(--t2-cta);color:var(--t2-cta-text);font-size:17px;font-weight:900;line-height:1.25;border:none;border-radius:50px;padding:12px 20px;cursor:pointer;text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,.25);max-width:340px;width:100%;margin:10px auto 0;text-align:center;position:relative;z-index:1;animation:t2pulse 2s ease-in-out infinite;transition:transform .15s,background .15s}
          .t2-cta:hover{background:var(--t2-cta-hover)}
          .t2-cta:active{transform:scale(.97)}
          @keyframes t2pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
          .t2-cta small{display:block;font-size:11px;opacity:.85;font-weight:600;margin-top:3px}
          .t2-cta-main{display:flex;align-items:center;justify-content:center;gap:10px}
          .t2-free{display:block;text-align:center;font-size:13px;margin-top:8px;font-style:italic;opacity:.65;position:relative;z-index:1}
          .t2-stats{display:flex;justify-content:center;gap:8px;margin-top:10px;position:relative;z-index:1;flex-wrap:wrap}
          .t2-stat{background:#00000010;border:1px solid #00000018;border-radius:10px;padding:6px 12px;text-align:center;color:var(--t2-primary);min-width:80px}
          .t2-stat .num{font-size:17px;font-weight:900;display:block;line-height:1}
          .t2-stat .lbl{font-size:9px;opacity:.75;text-transform:uppercase;letter-spacing:.04em}
          .t2-section{padding:26px 0 10px;background:color-mix(in srgb,var(--t2-hero) 12%,var(--t2-bg))}
          .t2-sec-title{text-align:center;font-size:20px;font-weight:900;margin-bottom:4px;padding:0 20px}
          .t2-sec-sub{text-align:center;font-size:13px;color:#777;margin-bottom:16px;padding:0 20px}
          .t2-cupons{padding:28px 0 24px;background:color-mix(in srgb,var(--t2-hero) 18%,var(--t2-cupons))}
          .t2-cupons-note{text-align:center;font-size:13px;color:#777;margin-top:14px;padding:0 20px;line-height:1.55}
          .t2-final{background:linear-gradient(160deg,var(--t2-final1),var(--t2-final2));padding:32px 20px 40px;text-align:center}
          .t2-final h2{font-size:22px;font-weight:900;color:var(--t2-primary);margin-bottom:8px;line-height:1.25}
          .t2-final p{font-size:14px;color:var(--t2-primary);opacity:.7;margin-bottom:20px}
          .t2-vagas{background:#00000018;border-radius:50px;height:8px;max-width:280px;margin:0 auto 6px;overflow:hidden}
          .t2-vagas-fill{background:var(--t2-primary);border-radius:50px;height:100%;transition:width 1.4s ease-out}
          .t2-vagas-label{font-size:12px;opacity:.65;color:var(--t2-primary);margin-bottom:20px}
          .t2-trust{display:flex;justify-content:center;gap:18px;margin-top:16px;flex-wrap:wrap;font-size:12px;color:var(--t2-primary);opacity:.7}
          .t2-overlay{display:none;position:fixed;inset:0;background:color-mix(in srgb,var(--t2-primary) 96%,transparent);z-index:1000;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center}
          .t2-overlay.open{display:flex}
          .t2-ov-icon{font-size:56px;margin-bottom:16px}
          .t2-ov-title{font-size:24px;font-weight:900;color:#fff;margin-bottom:8px}
          .t2-ov-sub{font-size:15px;color:#ffffffe0;margin-bottom:28px;line-height:1.5}
          .t2-ov-benefits{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;justify-content:center}
          .t2-ov-benefit{background:#fff3;border:1px solid rgba(255,255,255,.4);border-radius:50px;padding:6px 14px;color:#fff;font-size:12px;font-weight:800}
          .t2-ov-bar{height:6px;background:#ffffff4d;border-radius:50px;overflow:hidden;margin-bottom:6px;max-width:280px;width:100%}
          .t2-ov-fill{height:100%;background:var(--t2-hero);border-radius:50px;transition:width 1s linear}
          .t2-ov-label{font-size:12px;color:#fffc;margin-bottom:20px}
          .t2-ov-primary{display:block;background:var(--t2-hero);color:var(--t2-primary);font-size:16px;font-weight:900;border:none;border-radius:50px;padding:16px 32px;cursor:pointer;width:100%;max-width:300px}
          .t2-ov-copy{display:block;background:transparent;color:#ffffffd9;font-size:13px;font-weight:700;border:1.5px solid rgba(255,255,255,.5);border-radius:50px;padding:12px 28px;cursor:pointer;margin-top:10px;width:100%;max-width:300px}
          .t2-footer{background:var(--t2-footer);color:#f5f5f5;padding:36px 20px 24px;text-align:center}
          .t2-footer-brand{font-size:22px;font-weight:900;color:var(--t2-footer-hi);margin-bottom:8px}
          .t2-footer-sub{font-size:13px;color:#bdbdbd;max-width:320px;margin:0 auto 20px;line-height:1.5}
          .t2-footer-note{font-size:12px;color:#9a9a9a;line-height:1.65;max-width:640px;margin:0 auto 12px}
          .t2-footer-copy{font-size:12px;color:#7a7a7a}
        `}</style>

        {/* HERO */}
        <section className="t2-hero">
          {config.heroBadge ? <span className="t2-badge">{config.heroBadge}</span> : null}
          <h1>
            {config.heroTituloAntes}
            {heroLogo ? (
              <img src={heroLogo} alt={config.heroLogoAlt} className="t2-hero-logo" />
            ) : (
              <span className="t2-hero-logo-fallback">{config.heroLogoAlt}</span>
            )}
            {config.heroTituloDepois}
          </h1>
          <p className="t2-sub">{config.heroSubtitulo}</p>

          <Carousel id="ofertas" count={config.ofertas.length || 3} cardMin="178px">
            {config.ofertas.length > 0
              ? config.ofertas.map((src, i) => (
                  <div key={i} data-card className="t2-card">
                    <StorageImage src={src} alt={`Oferta ${i + 1} — ${mentorado.nome}`} />
                  </div>
                ))
              : [0, 1, 2].map((i) => (
                  <PlaceholderCard key={i} emoji="🛍️" label={`Espaço da oferta ${i + 1} — adicione no painel`} />
                ))}
          </Carousel>

          <button className="t2-cta" onClick={openOverlay}>
            <span className="t2-cta-main">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.14c-.24.68-1.4 1.31-1.94 1.36-.54.05-1.05.25-3.53-.73-2.98-1.18-4.87-4.24-5.02-4.44-.15-.2-1.2-1.6-1.2-3.05s.76-2.16 1.03-2.46c.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.19.01.44-.07.68.52.25.6.85 2.06.93 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.75 1.24 1.61 2.01 1.1.98 2.03 1.29 2.33 1.44.3.15.47.13.65-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.12.08.73-.16 1.41z" />
              </svg>
              <span>
                <span style={{ display: "block" }}>{config.ctaTexto1}</span>
                <span style={{ display: "block" }}>{config.ctaTexto2}</span>
              </span>
            </span>
            <small>{config.ctaSub}</small>
          </button>
          <span className="t2-free">{config.freeTag}</span>

          <div className="t2-stats">
            <div className="t2-stat">
              <span className="num">{config.stat1Num}</span>
              <span className="lbl">{config.stat1Label}</span>
            </div>
            <div className="t2-stat">
              <span className="num">{config.stat2Num}</span>
              <span className="lbl">{config.stat2Label}</span>
            </div>
            <div className="t2-stat">
              <span className="num">{config.stat3Num}</span>
              <span className="lbl">{config.stat3Label}</span>
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL */}
        <section className="t2-section">
          <h2 className="t2-sec-title">{config.provaTitulo}</h2>
          <p className="t2-sec-sub">{config.provaSub}</p>
          <Carousel id="provas" count={config.provas.length || 3} cardMin="240px">
            {config.provas.length > 0
              ? config.provas.map((src, i) => (
                  <div key={i} data-card className="t2-card-prova">
                    <StorageImage src={src} alt={`Depoimento ${i + 1}`} />
                  </div>
                ))
              : [0, 1, 2].map((i) => (
                  <PlaceholderCard key={i} tall emoji="💬" label={`Print ${i + 1} — adicione no painel`} />
                ))}
          </Carousel>
        </section>

        {/* CUPONS */}
        <div className="t2-cupons">
          <h2 className="t2-sec-title">{config.cupomTitulo}</h2>
          <p className="t2-sec-sub">{config.cupomSub}</p>
          <Carousel id="cupons" count={config.cupons.length || 3} cardMin="290px">
            {config.cupons.length > 0
              ? config.cupons.map((src, i) => (
                  <div key={i} data-card className="t2-card-cupom">
                    <StorageImage src={src} alt={`Cupom ${i + 1}`} />
                  </div>
                ))
              : [0, 1, 2].map((i) => (
                  <PlaceholderCard key={i} emoji="🎟️" label={`Cupom ${i + 1} — adicione no painel`} />
                ))}
          </Carousel>
          <p className="t2-cupons-note">{config.cupomNota}</p>
        </div>

        {/* CTA FINAL */}
        <div className="t2-final">
          <h2>{config.finalTitulo}</h2>
          <p>{config.finalSub}</p>
          <div className="t2-vagas">
            <div className="t2-vagas-fill" style={{ width: `${config.vagasPercent}%` }} />
          </div>
          <div className="t2-vagas-label">
            {config.vagasPercent}
            {config.vagasLabel}
          </div>
          <button className="t2-cta" onClick={openOverlay}>
            {config.ctaFinal}
            <small>{config.ctaFinalSub}</small>
          </button>
          <div className="t2-trust">
            <span>{config.trust1}</span>
            <span>{config.trust2}</span>
            <span>{config.trust3}</span>
          </div>
        </div>

        {/* OVERLAY */}
        <div className={`t2-overlay${overlayOpen ? " open" : ""}`} role="dialog" aria-modal="true">
          <div className="t2-ov-icon">🛍️</div>
          <div className="t2-ov-title">{config.overlayTitulo}</div>
          <div className="t2-ov-sub">{config.overlaySub}</div>
          <div className="t2-ov-benefits">
            <span className="t2-ov-benefit">{config.overlayBenefit1}</span>
            <span className="t2-ov-benefit">{config.overlayBenefit2}</span>
            <span className="t2-ov-benefit">{config.overlayBenefit3}</span>
          </div>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <div className="t2-ov-bar">
              <div className="t2-ov-fill" style={{ width: `${(countdown / 3) * 100}%` }} />
            </div>
            <div className="t2-ov-label">
              {countdown > 0 ? `Abrindo automaticamente em ${countdown}s…` : "Abrindo…"}
            </div>
          </div>
          <button
            className="t2-ov-primary"
            onClick={() => window.open(mentorado.linkCta, "_blank", "noopener")}
          >
            📲 Abrir WhatsApp agora
          </button>
          <button className="t2-ov-copy" onClick={copyLink}>
            {copied ? "✓ Link copiado!" : "Copiar link do grupo"}
          </button>
        </div>

        {/* RODAPÉ */}
        <footer className="t2-footer">
          <div className="t2-footer-brand">{config.footerMarca}</div>
          <div className="t2-footer-sub">{config.footerSub}</div>
          <p className="t2-footer-note">{config.footerDisclaimer}</p>
          <div className="t2-footer-copy">{config.footerCopyright}</div>
        </footer>
      </div>
    </>
  );
}
