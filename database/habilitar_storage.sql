-- ====================================================================
-- HABILITAÇÃO DO BUCKET DE FOTOS E VÍDEOS (SUPABASE STORAGE)
-- Permite upload de vídeos MP4 e fotos direto pelo Painel Administrativo
-- ====================================================================

-- 1. Cria o bucket público 'portfolio' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permite leitura e escrita pública anônima no bucket portfolio
DROP POLICY IF EXISTS "Acesso público aos uploads de portfolio" ON storage.objects;
CREATE POLICY "Acesso público aos uploads de portfolio"
ON storage.objects FOR ALL
TO anon, authenticated, service_role
USING (bucket_id = 'portfolio')
WITH CHECK (bucket_id = 'portfolio');

NOTIFY pgrst, 'reload schema';
