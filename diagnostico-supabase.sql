-- =========================================================
-- DIAGNÓSTICO: o que já existe no seu Supabase?
-- Rode no SQL Editor do Supabase e me mande o resultado.
-- =========================================================

-- 1. Tabelas no schema public
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Quantas linhas em cada tabela (vê se tem dados)
SELECT
  schemaname,
  relname AS tabela,
  n_live_tup AS linhas
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- 3. Tabelas de migrations (controladas pelo Prisma)
SELECT
  migration_name,
  finished_at,
  applied_steps_count
FROM "public"."_prisma_migrations"
ORDER BY started_at DESC
LIMIT 10;

-- 4. Buckets que existem
SELECT id, name, public, created_at
FROM storage.buckets
ORDER BY created_at;
