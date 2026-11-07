"use client";

import { useCallback, useEffect, useState } from "react";
import { MetaPixel, MetaPixelNoScript } from "./MetaPixel";
import { StorageImage } from "./StorageImage";
import "./LandingPromo.css";

interface MentoradoBase {
  nome: string;
  linkCta: string;
  pixelId: string | null;
  imagemUrl: string | null;
}

interface PromoConfig {
  corUrgencia: string;
  corDestaque: string;
  corFundo: string;
  corTexto: string;
  corTextoSecundario: string;
  corBotao: string;
  corBotaoHover: string;
  urgenciaTexto: string;
  heroTituloAntes: string;
  heroTituloDestaque: string;
  heroSubtitulo: string;
  ctaTexto: string;
  ctaSub: string;
  escassezLabel: string;
  escassezTexto: string;
  beneficio1Titulo: string;
  beneficio1Texto: string;
  beneficio2Titulo: string;
  beneficio2Texto: string;
  beneficio3Titulo: string;
  beneficio3Texto: string;
  footerPrivacidade: string;
  footerTermos: string;
  footerCreditNome: string;
  footerCreditUrl: string;
  spotsIniciais: number;
  spotsMinimo: number;
}

export const DEFAULT_PROMO_COMPONENT: PromoConfig = {
  corUrgencia: "#F45B8C",
  corDestaque: "#F6C85F",
  corFundo: "#FFF9F2",
  corTexto: "#6B4F4F",
  corTextoSecundario: "#8C7070",
  corBotao: "#25D366",
  corBotaoHover: "#20bd5a",
  urgenciaTexto: "Últimas Vagas do Dia",
  heroTituloAntes: "Receba as Melhores Promoções e",
  heroTituloDestaque: "Economize de Verdade",
  heroSubtitulo:
    "Entre agora e receba alertas de grandes ofertas, promoções reais e cupons secretos para fazer seu dinheiro render muito mais.",
  ctaTexto: "QUERO ENTRAR AGORA",
  ctaSub: "Grupo Gratuito • Sem Spam",
  escassezLabel: "Vagas Restantes",
  escassezTexto: "disponíveis",
  beneficio1Titulo: "Casa Completa",
  beneficio1Texto: "Móveis, utensílios e decoração com preços que cabem no bolso.",
  beneficio2Titulo: "Garimpo de Ofertas",
  beneficio2Texto: "Encontramos as melhores promoções para você economizar de verdade.",
  beneficio3Titulo: "Cupons Exclusivos",
  beneficio3Texto: "Códigos testados para Shopee, Amazon e Magalu.",
  footerPrivacidade: "Política de Privacidade",
  footerTermos: "Termos de Uso",
  footerCreditNome: "Sua Agência",
  footerCreditUrl: "#",
  spotsIniciais: 24,
  spotsMinimo: 3,
};

function getPromoConfigComponent(raw: unknown): PromoConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PROMO_COMPONENT };
  }
  const c = raw as Record<string, unknown>;
  const pick = (key: keyof PromoConfig, fallback: string | number): string | number =>
    c[key] !== undefined && c[key] !== null && String(c[key]).length > 0
      ? (c[key] as string | number)
      : fallback;
  return {
    ...DEFAULT_PROMO_COMPONENT,
    ...Object.fromEntries(
      (Object.keys(DEFAULT_PROMO_COMPONENT) as (keyof PromoConfig)[]).map((k) => [
        k,
        pick(k, DEFAULT_PROMO_COMPONENT[k]),
      ])
    ),
  } as PromoConfig;
}

export function LandingPromo({
  mentorado,
  config,
}: {
  mentorado: MentoradoBase & {
    corTopo: string;
    corFundo: string;
    corBotao: string;
    corBotaoHover: string;
    corTexto: string;
    corTextoSecundario: string;
  };
  config: PromoConfig;
}) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [spots, setSpots] = useState(config.spotsIniciais);
  const [copied, setCopied] = useState(false);

  const openOverlay = useCallback(() => {
    setCountdown(3);
    setCopied(false);
    setOverlayOpen(true);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mentorado.linkCta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [mentorado.linkCta]);

  useEffect(() => {
    const names = [
      "Camila",
      "Bruna",
      "Patrícia",
      "Fernanda",
      "Juliana",
      "Larissa",
      "Mariana",
      "Amanda",
      "Renata",
    ];
    const cities = [
      "São Paulo",
      "Rio de Janeiro",
      "Curitiba",
      "Salvador",
      "Brasília",
      "Belo Horizonte",
      "Recife",
    ];

    function triggerEvent() {
      if (spots > config.spotsMinimo) {
        setSpots((prev) => {
          const next = prev - 1;
          const el = document.getElementById("promo-spots-count");
          if (el) {
            el.style.color = "#FF0000";
            setTimeout(() => {
              el.style.color = config.corTexto;
            }, 500);
          }
          const name = names[Math.floor(Math.random() * names.length)];
          const city = cities[Math.floor(Math.random() * cities.length)];
          const div = document.createElement("div");
          div.className = "promo-toast";

          const icon = document.createElement("i");
          icon.className = "fas fa-check-circle";
          icon.style.color = config.corDestaque;
          icon.style.fontSize = "16px";

          const textDiv = document.createElement("div");
          const strong = document.createElement("strong");
          strong.textContent = name;
          const rest = document.createTextNode(` de ${city} entrou no grupo.`);
          textDiv.appendChild(strong);
          textDiv.appendChild(rest);

          div.appendChild(icon);
          div.appendChild(textDiv);
          document.body.appendChild(div);
          requestAnimationFrame(() => div.classList.add("show"));
          setTimeout(() => {
            div.classList.remove("show");
            setTimeout(() => div.remove(), 500);
          }, 1800);
          return next;
        });
      }
    }

    const t0 = setTimeout(() => {
      triggerEvent();
      setInterval(triggerEvent, 2000);
    }, 2000);
    return () => clearTimeout(t0);
  }, [spots, config]);

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

  const heroLogo = mentorado.imagemUrl;

  const rootStyle = {
    "--promo-urgencia": config.corUrgencia,
    "--promo-destaque": config.corDestaque,
    "--promo-fundo": config.corFundo,
    "--promo-texto": config.corTexto,
    "--promo-texto-secundario": config.corTextoSecundario,
    "--promo-botao": config.corBotao,
    "--promo-botao-hover": config.corBotaoHover,
  };

  return (
    <>
      <MetaPixel pixelId={mentorado.pixelId} />
      <MetaPixelNoScript pixelId={mentorado.pixelId} />

      <div className="promo-root" style={rootStyle as never}>
        <div className="promo-urgencia">
          <span className="promo-urgencia-icon">!</span>
          {config.urgenciaTexto}
        </div>

        <div className="promo-container">
          {heroLogo ? (
            <div className="promo-logo">
              <StorageImage src={heroLogo} alt={mentorado.nome} />
            </div>
          ) : null}

          <h1>
            {config.heroTituloAntes} <br />
            <span className="promo-highlight">{config.heroTituloDestaque}</span>
          </h1>

          <p className="promo-subtitle">{config.heroSubtitulo}</p>

          <div className="promo-cta-box">
            <a
              href={mentorado.linkCta}
              target="_blank"
              rel="noopener noreferrer"
              className="promo-cta"
              onClick={openOverlay}
            >
              <i className="fab fa-whatsapp"></i>{" "}
              {config.ctaTexto}
            </a>
            <p className="promo-cta-sub">{config.ctaSub}</p>
          </div>

          <div className="promo-scarcity">
            <div className="promo-scarcity-icon">
              <i className="far fa-clock"></i>
            </div>
            <div className="promo-scarcity-content">
              <span className="promo-scarcity-label">{config.escassezLabel}</span>
              <div className="promo-scarcity-count">
                Apenas <span id="promo-spots-count">{spots}</span>{" "}
                {config.escassezTexto}
              </div>
            </div>
          </div>

          <div className="promo-benefits">
            <div className="promo-benefit">
              <div className="promo-benefit-icon">
                <i className="fas fa-home"></i>
              </div>
              <div>
                <h3>{config.beneficio1Titulo}</h3>
                <p>{config.beneficio1Texto}</p>
              </div>
            </div>
            <div className="promo-benefit">
              <div className="promo-benefit-icon">
                <i className="fas fa-search-dollar"></i>
              </div>
              <div>
                <h3>{config.beneficio2Titulo}</h3>
                <p>{config.beneficio2Texto}</p>
              </div>
            </div>
            <div className="promo-benefit">
              <div className="promo-benefit-icon">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div>
                <h3>{config.beneficio3Titulo}</h3>
                <p>{config.beneficio3Texto}</p>
              </div>
            </div>
          </div>

          <div className="promo-footer">
            <div style={{ marginBottom: 5 }}>
              <a href="#" className="promo-footer-link">
                {config.footerPrivacidade}
              </a>{" "}
              &bull;
              <a href="#" className="promo-footer-link">
                {config.footerTermos}
              </a>
            </div>
            <a
              href={config.footerCreditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="promo-credit"
            >
              Feito com <i className="fas fa-heart"></i> por{" "}
              <strong>{config.footerCreditNome}</strong>
            </a>
          </div>
        </div>

        <div
          className={`promo-loading${overlayOpen ? " promo-loading-open" : ""}`}
          id="promo-loading"
        >
          <div className="promo-spinner"></div>
          <p
            style={{
              fontFamily: '"Playfair Display",Georgia,serif',
              color: config.corTexto,
              fontWeight: 700,
            }}
          >
            Acessando grupo…
          </p>
        </div>

        <div
          className={`promo-toast-overlay${overlayOpen ? " open" : ""}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="promo-ov-content">
            <div className="promo-ov-icon">🛍️</div>
            <div className="promo-ov-title">Aguarde…</div>
            <div className="promo-ov-sub">Redirecionando para o WhatsApp</div>
            <div style={{ width: "100%", maxWidth: 280, margin: "0 auto 20px" }}>
              <div className="promo-ov-bar">
                <div
                  className="promo-ov-fill"
                  style={{ width: `${(countdown / 3) * 100}%` }}
                />
              </div>
              <div className="promo-ov-label">
                {countdown > 0
                  ? `Abrindo automaticamente em ${countdown}s…`
                  : "Abrindo…"}
              </div>
            </div>
            <button
              className="promo-ov-primary"
              onClick={() => {
                window.open(mentorado.linkCta, "_blank", "noopener");
                setOverlayOpen(false);
              }}
            >
              📲 Abrir WhatsApp agora
            </button>
            <button className="promo-ov-copy" onClick={copyLink}>
              {copied ? "✓ Link copiado!" : "Copiar link do grupo"}
            </button>
          </div>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </>
  );
}
