-- =========================================================
-- Migration para Supabase — cria as 5 tabelas do app
-- Método GL — Painel de Mentorados
--
-- ⚠️  SE JÁ TIVER DADOS: este script usa IF NOT EXISTS,
-- então não vai quebrar se as tabelas já existirem.
-- Mas se faltar alguma coluna em uma tabela existente, ela
-- NÃO será adicionada (você precisaria de um ALTER TABLE manual).
--
-- Como rodar:
-- 1. Acesse https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Menu lateral → SQL Editor → "New query"
-- 4. Cole TODO este conteúdo
-- 5. Clique em "Run" (Ctrl+Enter)
-- =========================================================

-- Enum das categorias de vídeo
DO $$ BEGIN
  CREATE TYPE "VideoCategory" AS ENUM ('COMECE_POR_AQUI', 'TRAFEGO_PAGO', 'ESTRUTURA_DA_OPERACAO', 'CRIATIVOS', 'METRICAS', 'EVASAO', 'GRUPOS', 'VENDAS', 'FINANCEIRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela User (admin do painel)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Tabela Mentorado (páginas de captura dos mentorados)
CREATE TABLE IF NOT EXISTS "Mentorado" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tituloHero" TEXT NOT NULL DEFAULT 'APROVEITE AGORA AS MELHORES PROMOÇÕES DE 2026!',
    "tituloSecao" TEXT NOT NULL DEFAULT '🤑 GRUPO VIP DE PROMOÇÕES E CUPONS',
    "texto1" TEXT NOT NULL DEFAULT 'Produtos com 50%, 60% e 70% OFF',
    "texto2" TEXT NOT NULL DEFAULT 'MAIS DE 50 MIL MEMBROS APROVEITANDO AS OFERTAS, ENTRE JÁ!',
    "texto3" TEXT NOT NULL DEFAULT 'JÁ SOMOS +50 MIL MEMBROS',
    "imagemUrl" TEXT,
    "linkCta" TEXT NOT NULL,
    "corTopo" TEXT NOT NULL DEFAULT '#ff0000',
    "corFundo" TEXT NOT NULL DEFAULT '#000000',
    "corBotao" TEXT NOT NULL DEFAULT '#29E843',
    "corBotaoHover" TEXT NOT NULL DEFAULT '#02FF07',
    "corTexto" TEXT NOT NULL DEFAULT '#FFFFFF',
    "corTextoSecundario" TEXT NOT NULL DEFAULT '#DADADA',
    "pixelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentorado_pkey" PRIMARY KEY ("id")
);

-- Tabela Video (aulas do Método GL)
CREATE TABLE IF NOT EXISTS "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "VideoCategory" NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- Tabela PageContent (conteúdo editável da LP via admin)
CREATE TABLE IF NOT EXISTS "PageContent" (
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("key")
);

-- Índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Mentorado_slug_key" ON "Mentorado"("slug");

-- Índices de busca
CREATE INDEX IF NOT EXISTS "Video_category_idx" ON "Video"("category");
CREATE INDEX IF NOT EXISTS "Video_order_idx" ON "Video"("order");

-- =========================================================
-- Bucket de Storage para upload de vídeos/thumbnails
-- (você já criou o "mentorados" — esse é o "videos")
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy de leitura pública para o bucket videos
DO $$ BEGIN
  CREATE POLICY "Allow public read videos" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'videos');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =========================================================
-- Pronto! Após rodar:
-- 1. Acesse https://metodogl.online/admin/login
-- 2. Se não tiver usuário admin, rode localmente:
--      curl -X POST https://metodogl.online/api/seed
--    ou localmente: http://localhost:3000/api/seed
--    Isso cria o admin@metodogl.online / admin123
-- 3. Vá em /admin/modulos e clique em "Importar exemplo"
--    para popular com os 10 vídeos de data/videos.ts
-- =========================================================
