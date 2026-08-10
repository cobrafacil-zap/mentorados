"use client";

import { MetaPixel, MetaPixelNoScript } from "./MetaPixel";

// Shape local (espelha `model Mentorado` em prisma/schema.prisma).
// Motivo: importar `Mentorado` de "@prisma/client" faz o bundler
// trazer o PrismaClient inteiro pro client; mesmo `import type`
// não é confiável. Campos marcados `?` porque o server pode
// enviar `null` em alguns opcionais.
interface MentoradoData {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
  tituloHero: string;
  tituloSecao: string;
  texto1: string;
  texto2: string;
  texto3: string;
  imagemUrl: string | null;
  linkCta: string;
  corTopo: string;
  corFundo: string;
  corBotao: string;
  corBotaoHover: string;
  corTexto: string;
  corTextoSecundario: string;
  pixelId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LandingPageProps {
  mentorado: MentoradoData;
}

export function LandingPage({ mentorado }: LandingPageProps) {
  return (
    <>
      <MetaPixel pixelId={mentorado.pixelId} />
      <MetaPixelNoScript pixelId={mentorado.pixelId} />

      <main className="flex min-h-screen flex-col font-sans">
        {/* Header vermelho */}
        <section
          className="w-full py-4 px-4 text-center"
          style={{ backgroundColor: mentorado.corTopo, color: mentorado.corTexto }}
        >
          <h1
            className="text-2xl md:text-3xl font-normal leading-tight"
            style={{ color: mentorado.corTexto }}
            dangerouslySetInnerHTML={{ __html: mentorado.tituloHero }}
          />
        </section>

        {/* Seção principal */}
        <section
          className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center"
          style={{
            background: `radial-gradient(circle at center, rgb(0,0,0) 0%, ${mentorado.corFundo} 97%)`,
            color: mentorado.corTexto,
          }}
        >
          <div className="w-full max-w-xl space-y-6">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: mentorado.corTexto }}
              dangerouslySetInnerHTML={{ __html: mentorado.tituloSecao }}
            />

            <p
              className="text-lg"
              style={{ color: mentorado.corTextoSecundario }}
              dangerouslySetInnerHTML={{ __html: mentorado.texto1 }}
            />

            <p
              className="text-lg font-bold"
              style={{ color: mentorado.corTexto }}
              dangerouslySetInnerHTML={{ __html: mentorado.texto2 }}
            />

            {mentorado.imagemUrl ? (
              <div className="flex justify-center py-2">
                <img
                  src={mentorado.imagemUrl}
                  alt={mentorado.nome}
                  className="h-48 w-48 object-cover"
                  style={{ borderRadius: "94px", border: "4px solid #ff0000" }}
                />
              </div>
            ) : null}

            <a
              href={mentorado.linkCta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full px-8 py-4 text-xl md:text-2xl font-medium transition-transform hover:scale-105"
              style={{
                backgroundColor: mentorado.corBotao,
                color: "#000000",
                borderRadius: "23px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = mentorado.corBotaoHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = mentorado.corBotao)
              }
            >
              QUERO ENTRAR NO GRUPO
            </a>

            <p
              className="text-xl font-bold"
              style={{ color: mentorado.corTexto }}
              dangerouslySetInnerHTML={{ __html: mentorado.texto3 }}
            />
          </div>
        </section>

        {/* Footer vermelho */}
        <section
          className="w-full py-3 px-4 text-center"
          style={{ backgroundColor: mentorado.corTopo, color: mentorado.corTexto }}
        >
          <p className="text-sm md:text-base">Todos direitos reservados - SM Company</p>
        </section>
      </main>
    </>
  );
}
