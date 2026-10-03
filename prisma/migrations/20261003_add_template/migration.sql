-- Add template selector + per-template config to Mentorado
ALTER TABLE "Mentorado" ADD COLUMN IF NOT EXISTS "template" TEXT NOT NULL DEFAULT 'classico';
ALTER TABLE "Mentorado" ADD COLUMN IF NOT EXISTS "templateConfig" JSONB;
