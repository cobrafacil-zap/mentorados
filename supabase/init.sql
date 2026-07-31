-- SQL inicial para criar tabelas no Supabase
-- Rode isso no Supabase SQL Editor

-- Extensão necessária para cuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários administradores
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mentorados
CREATE TABLE IF NOT EXISTS "Mentorado" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    slug TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,

    "tituloHero" TEXT NOT NULL DEFAULT 'APROVEITE AGORA AS MELHORES PROMOÇÕES DE 2026!',
    "tituloSecao" TEXT NOT NULL DEFAULT '🤑 GRUPO VIP DE PROMOÇÕES E CUPONS',
    texto1 TEXT NOT NULL DEFAULT 'Produtos com 50%, 60% e 70% OFF',
    texto2 TEXT NOT NULL DEFAULT 'MAIS DE 50 MIL MEMBROS APROVEITANDO AS OFERTAS, ENTRE JÁ!',
    texto3 TEXT NOT NULL DEFAULT 'JÁ SOMOS +50 MIL MEMBROS',
    "imagemUrl" TEXT,
    "linkCta" TEXT NOT NULL,

    "corTopo" TEXT NOT NULL DEFAULT '#ff0000',
    "corFundo" TEXT NOT NULL DEFAULT '#232323',
    "corBotao" TEXT NOT NULL DEFAULT '#29E843',
    "corBotaoHover" TEXT NOT NULL DEFAULT '#02FF07',
    "corTexto" TEXT NOT NULL DEFAULT '#FFFFFF',
    "corTextoSecundario" TEXT NOT NULL DEFAULT '#DADADA',

    "pixelId" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mentorado_updated_at ON "Mentorado";

CREATE TRIGGER update_mentorado_updated_at
BEFORE UPDATE ON "Mentorado"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
