-- =========================================================
-- Migration: templates de página do mentorado
-- Como rodar: Supabase Dashboard → SQL Editor → New query → colar → Run
-- (Idempotente: pode rodar mais de uma vez sem quebrar.)
-- Também espelhada em prisma/migrations/20261003_add_template/
-- =========================================================

ALTER TABLE "Mentorado" ADD COLUMN IF NOT EXISTS "template" TEXT NOT NULL DEFAULT 'classico';
ALTER TABLE "Mentorado" ADD COLUMN IF NOT EXISTS "templateConfig" JSONB;
