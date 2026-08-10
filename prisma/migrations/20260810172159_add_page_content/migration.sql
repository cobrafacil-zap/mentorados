-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('COMECE_POR_AQUI', 'TRAFEGO_PAGO', 'ESTRUTURA_DA_OPERACAO', 'CRIATIVOS', 'METRICAS', 'EVASAO', 'GRUPOS', 'VENDAS', 'FINANCEIRO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorado" (
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

-- CreateTable
CREATE TABLE "Video" (
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

-- CreateTable
CREATE TABLE "PageContent" (
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorado_slug_key" ON "Mentorado"("slug");

-- CreateIndex
CREATE INDEX "Video_category_idx" ON "Video"("category");

-- CreateIndex
CREATE INDEX "Video_order_idx" ON "Video"("order");

