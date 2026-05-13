-- =============================================
-- SETUP SUPABASE STORAGE UNTUK TOKO-TAHU
-- Jalankan di: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Buat bucket 'uploads' (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access" ON storage.objects;

-- 3. Policy: siapapun bisa BACA file (public)
CREATE POLICY "Public read uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- 4. Policy: user yang login bisa UPLOAD
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 5. Policy: user yang login bisa UPDATE (overwrite)
CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

-- 6. Policy: user yang login bisa DELETE
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
