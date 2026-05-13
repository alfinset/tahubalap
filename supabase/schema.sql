-- ============================================================
-- TOKO TAHU - SUPABASE DATABASE SCHEMA
-- Jalankan SQL ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABEL PROFILES (data tambahan user selain auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  telepon TEXT,
  alamat TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KATEGORIS
CREATE TABLE IF NOT EXISTS kategoris (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PRODUKS
CREATE TABLE IF NOT EXISTS produks (
  id BIGSERIAL PRIMARY KEY,
  kategori_id BIGINT REFERENCES kategoris(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  deskripsi TEXT,
  harga INTEGER NOT NULL DEFAULT 0,
  stok INTEGER NOT NULL DEFAULT 0,
  gambar TEXT,
  satuan TEXT DEFAULT 'pcs',
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PESANANS
CREATE TABLE IF NOT EXISTS pesanans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  kode_pesanan TEXT UNIQUE NOT NULL,
  total_harga INTEGER NOT NULL DEFAULT 0,
  ongkos_kirim INTEGER NOT NULL DEFAULT 5000,
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu','diproses','dikirim','selesai','dibatalkan')),
  alamat_pengiriman TEXT NOT NULL,
  telepon TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL DETAIL PESANANS
CREATE TABLE IF NOT EXISTS detail_pesanans (
  id BIGSERIAL PRIMARY KEY,
  pesanan_id BIGINT REFERENCES pesanans(id) ON DELETE CASCADE NOT NULL,
  produk_id BIGINT REFERENCES produks(id) ON DELETE SET NULL,
  jumlah INTEGER NOT NULL DEFAULT 1,
  harga_satuan INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL PEMBAYARANS
CREATE TABLE IF NOT EXISTS pembayarans (
  id BIGSERIAL PRIMARY KEY,
  pesanan_id BIGINT REFERENCES pesanans(id) ON DELETE CASCADE UNIQUE NOT NULL,
  metode_bayar TEXT CHECK (metode_bayar IN ('cod', 'transfer')),
  jumlah_bayar INTEGER,
  bukti_transfer TEXT,
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu','dikonfirmasi','ditolak')),
  tanggal_bayar TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL RESEPS
CREATE TABLE IF NOT EXISTS reseps (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kategori TEXT,
  badge TEXT,
  badge_color TEXT,
  emoji TEXT,
  waktu TEXT,
  level TEXT,
  harga INTEGER,
  deskripsi TEXT,
  bahan JSONB DEFAULT '[]',
  langkah JSONB DEFAULT '[]',
  tips TEXT,
  gambar TEXT,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: Kurangi stok produk (dipanggil saat checkout)
-- ============================================================
CREATE OR REPLACE FUNCTION kurangi_stok(p_produk_id BIGINT, p_jumlah INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE produks
  SET stok = GREATEST(0, stok - p_jumlah),
      updated_at = NOW()
  WHERE id = p_produk_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Auto-create profile saat user baru register
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_pesanans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayarans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE produks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseps ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Produk & Kategori: publik bisa baca
CREATE POLICY "produks_public_read" ON produks FOR SELECT USING (aktif = true);
CREATE POLICY "kategoris_public_read" ON kategoris FOR SELECT USING (true);
CREATE POLICY "reseps_public_read" ON reseps FOR SELECT USING (aktif = true);
CREATE POLICY "settings_public_read" ON settings FOR SELECT USING (true);

-- Pesanan: customer hanya lihat milik sendiri
CREATE POLICY "pesanans_select_own" ON pesanans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pesanans_insert_own" ON pesanans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Detail pesanan: bisa baca jika pesanan milik sendiri
CREATE POLICY "detail_select_own" ON detail_pesanans FOR SELECT
  USING (EXISTS (SELECT 1 FROM pesanans p WHERE p.id = pesanan_id AND p.user_id = auth.uid()));
CREATE POLICY "detail_insert_own" ON detail_pesanans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pesanans p WHERE p.id = pesanan_id AND p.user_id = auth.uid()));

-- Pembayaran
CREATE POLICY "pembayaran_select_own" ON pembayarans FOR SELECT
  USING (EXISTS (SELECT 1 FROM pesanans p WHERE p.id = pesanan_id AND p.user_id = auth.uid()));
CREATE POLICY "pembayaran_insert_own" ON pembayarans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pesanans p WHERE p.id = pesanan_id AND p.user_id = auth.uid()));
CREATE POLICY "pembayaran_update_own" ON pembayarans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM pesanans p WHERE p.id = pesanan_id AND p.user_id = auth.uid()));

-- Notifikasi: hanya bisa akses milik sendiri
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_own" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA - Kategori
-- ============================================================
INSERT INTO kategoris (nama, slug, deskripsi) VALUES
('Tahu Mentah', 'tahu-mentah', 'Tahu segar siap dimasak'),
('Tahu Olahan', 'tahu-olahan', 'Tahu siap saji'),
('Tahu Premium', 'tahu-premium', 'Tahu kualitas terbaik')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA - Produk
-- ============================================================
INSERT INTO produks (kategori_id, nama, slug, harga, stok, satuan, aktif, deskripsi) VALUES
(1, 'Tahu Putih Segar', 'tahu-putih-segar', 5000, 100, 'bungkus', true, 'Tahu putih berkualitas tinggi, segar setiap hari dari pengrajin lokal.'),
(1, 'Tahu Kuning', 'tahu-kuning', 6000, 80, 'bungkus', true, 'Tahu kuning dengan cita rasa khas yang gurih dan lembut.'),
(2, 'Tahu Goreng Crispy', 'tahu-goreng-crispy', 8000, 50, 'bungkus', true, 'Tahu goreng dengan tekstur renyah di luar, lembut di dalam.'),
(2, 'Tahu Bacem', 'tahu-bacem', 10000, 40, 'bungkus', true, 'Tahu bacem dengan bumbu khas Jawa yang manis dan gurih.'),
(3, 'Tahu Sutra Premium', 'tahu-sutra-premium', 15000, 30, 'kg', true, 'Tahu sutra lembut premium, cocok untuk masakan halus.'),
(3, 'Tahu Organik Non-GMO', 'tahu-organik-non-gmo', 20000, 20, 'kg', true, 'Tahu organik tanpa GMO, sehat dan berkualitas tinggi.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA - Settings
-- ============================================================
INSERT INTO settings (key, value) VALUES
('nama_toko', 'Tahu Balap'),
('deskripsi_toko', 'Toko tahu terbaik dengan pengiriman tercepat'),
('hero_badge', 'Freshly Racing to Your Table 🏎️'),
('hero_title', 'Rasakan Tahu Balap yang Cepat & Lezat'),
('hero_subtitle', 'Nikmati cita rasa street food otentik dengan standar kebersihan modern. Tahu segar berkualitas tinggi dari pengrajin lokal terpercaya.'),
('telepon_toko', '+62 812 3456 7890'),
('alamat_toko', 'Jl. Tahu Balap No. 1, Indonesia'),
('email_toko', 'info@tahubalap.com'),
('rekening_bank', 'BCA 1234567890 a/n Tahu Balap')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED DATA - Resep
-- ============================================================
INSERT INTO reseps (nama, slug, badge, badge_color, emoji, waktu, level, harga, deskripsi,
  bahan, langkah, tips, aktif) VALUES
(
  'Tahu Balap Goreng Crispy',
  'tahu-balap-goreng-crispy',
  'Best Seller',
  '#FF5C00',
  '🍳',
  '20 menit',
  'Mudah',
  15000,
  'Resep andalan Tahu Balap yang paling digemari. Dengan teknik penggorengan khusus, tahu menjadi super renyah di luar namun tetap lembut dan gurih di dalam.',
  '["6 potong Tahu Putih Segar Tahu Balap", "3 siung bawang putih, haluskan", "1 sdt garam", "1/2 sdt merica", "1/2 sdt ketumbar", "Minyak goreng secukupnya"]',
  '["Cuci bersih tahu, tiriskan hingga kering.", "Campur tahu dengan bawang putih, garam, merica, dan ketumbar. Diamkan 15 menit.", "Panaskan minyak goreng dalam wajan dengan api sedang.", "Goreng tahu hingga berwarna kuning keemasan dan renyah (±8 menit).", "Angkat dan tiriskan. Sajikan selagi panas."]',
  'Pastikan tahu benar-benar kering sebelum digoreng agar hasilnya lebih renyah dan tidak meletup-letup.',
  true
),
(
  'Tahu Crispy Saus Tiram',
  'tahu-crispy-saus-tiram',
  'Populer',
  '#FF8C42',
  '🥘',
  '30 menit',
  'Sedang',
  20000,
  'Perpaduan sempurna antara tahu goreng crispy dengan saus tiram yang gurih dan sedikit manis. Cocok sebagai lauk atau camilan.',
  '["8 potong Tahu Goreng Crispy Tahu Balap", "3 sdm saus tiram", "2 sdm kecap manis", "3 siung bawang putih, cincang", "1 buah cabai merah, iris", "Daun bawang secukupnya", "Minyak goreng secukupnya"]',
  '["Goreng tahu hingga crispy, sisihkan.", "Tumis bawang putih dan cabai hingga harum.", "Masukkan saus tiram dan kecap manis, aduk rata.", "Tambahkan sedikit air, masak hingga sedikit mengental.", "Masukkan tahu goreng, aduk hingga terbalut saus.", "Taburi daun bawang, sajikan."]',
  'Gunakan api besar saat membuat saus agar lebih harum dan tidak terlalu berminyak.',
  true
)
ON CONFLICT (slug) DO NOTHING;
