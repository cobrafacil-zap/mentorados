-- =========================================================
-- Adiciona coluna `emAguardo` à tabela Video.
--
-- Rode este SQL no SQL Editor do Supabase
-- (https://app.supabase.com/project/_/sql) ANTES de fazer deploy
-- do código que usa esse campo. O Prisma Client também precisa
-- ser regenerado (já foi via `npx prisma generate`).
--
-- `emAguardo` = "em breve":
--   - O vídeo continua aparecendo na listagem pública com badge "Em breve".
--   - O player fica bloqueado (mostra mensagem "Conteúdo em breve").
--   - Use pra sinalizar aulas futuras sem escondê-las do aluno.
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- =========================================================

ALTER TABLE "Video"
  ADD COLUMN IF NOT EXISTS "emAguardo" BOOLEAN NOT NULL DEFAULT false;

-- Confere
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'Video' AND column_name = 'emAguardo';