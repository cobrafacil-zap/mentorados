-- Configuração do bucket de imagens no Supabase
-- Rode no SQL Editor do Supabase

-- Insere o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('mentorados', 'mentorados', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para leitura pública
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'mentorados');

-- Política para upload via service_role (usado pela API /api/upload)
CREATE POLICY "Allow service role uploads"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'mentorados');

-- Política para delete via service_role
CREATE POLICY "Allow service role deletes"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'mentorados');
