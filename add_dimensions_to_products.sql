-- Jalankan SQL ini di Supabase SQL Editor untuk menambah kolom dimensions
-- Buka: app.supabase.com -> SQL Editor -> New Query -> Paste & Run

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}'::jsonb;

-- Pastikan cache schema di-refresh setelah menjalankan ini (biasanya otomatis)
-- Jika masih error, coba refresh halaman Dashboard Supabase Anda.
