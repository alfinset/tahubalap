# 🚀 Panduan Setup Supabase untuk TOKO TAHU

## Langkah 1: Buat Akun & Project Supabase

1. Buka **[https://supabase.com](https://supabase.com)** dan klik **Start your project**
2. Login dengan akun GitHub atau Google
3. Klik **New Project**
4. Isi form:
   - **Name**: `toko-tahu`
   - **Database Password**: buat password yang kuat (simpan!)
   - **Region**: pilih `Southeast Asia (Singapore)`
5. Klik **Create new project** — tunggu ~2 menit

---

## Langkah 2: Jalankan SQL Schema

1. Di dashboard Supabase, klik menu **SQL Editor** (sidebar kiri)
2. Klik **New query**
3. Buka file `supabase/schema.sql` di project ini
4. **Copy semua isinya** dan **paste** ke SQL Editor
5. Klik tombol **Run** (▶)
6. Tunggu hingga muncul `Success. No rows returned`

> ⚠️ Jika ada error, jalankan per bagian (mulai dari CREATE TABLE satu per satu)

---

## Langkah 3: Setup Supabase Storage

1. Di sidebar Supabase, klik **Storage**
2. Klik **New bucket**
3. Isi:
   - **Name**: `uploads`
   - **Public bucket**: ✅ **centang (aktifkan)**
4. Klik **Save**
5. Setelah bucket dibuat, klik bucket `uploads`
6. Klik tab **Policies** → **New policy** → **For full customization**
7. Buat policy ini:

```sql
-- Policy untuk upload (authenticated users)
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy untuk baca publik
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

---

## Langkah 4: Buat Akun Admin

1. Di Supabase, klik **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
3. Isi email dan password admin Anda
4. Klik **Create user**
5. Catat `user ID` yang muncul (format UUID) 8eb86375-9030-4621-bc33-c1a4f99ef8c0
6. Buka **SQL Editor**, jalankan query ini (ganti `USER_ID` dengan ID tadi):

```sql
-- Update role menjadi admin
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_ANDA_DI_SINI';

-- Jika profile belum ada, insert manual:
INSERT INTO profiles (id, name, email, role)
VALUES ('USER_ID_ANDA', 'Admin Toko', 'admin@tahubalap.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## Langkah 5: Ambil API Keys

1. Di Supabase, klik **Settings** (ikon ⚙️) → **API**
2. Salin nilai berikut:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` https://gcmflbohpuuvlddgfbhw.supabase.co
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbWZsYm9ocHV1dmxkZGdmYmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjMwMDEsImV4cCI6MjA5NDIzOTAwMX0.-KUGkQx_OMdATSNwn2WbNshZgzl0jjSznJcGURSVo3c
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbWZsYm9ocHV1dmxkZGdmYmh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY2MzAwMSwiZXhwIjoyMDk0MjM5MDAxfQ.5L3Z4XTlpumqQKMTkrfr9DIV1QqNSWopVgduv4tmu1M

3. Buka file `.env.local` di folder `nextjs/` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Langkah 6: Jalankan Project Locally

```bash
cd c:\laragon\www\toko-tahu\nextjs
npm run dev
```

Buka browser: **http://localhost:3000**

---

## Langkah 7: Aktifkan Realtime (Notifikasi)

1. Di Supabase, klik **Database** → **Replication**
2. Aktifkan Realtime untuk tabel:
   - ✅ `pesanans`
   - ✅ `notifications`

---

## Langkah 8: Deploy ke Vercel

1. Push project ke GitHub:
```bash
cd c:\laragon\www\toko-tahu\nextjs
git init
git add .
git commit -m "Initial commit: Toko Tahu Next.js"
git remote add origin https://github.com/USERNAME/toko-tahu-next.git
git push -u origin main
```

2. Buka **[https://vercel.com](https://vercel.com)** → **New Project**
3. Import repository dari GitHub
4. Di **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik **Deploy** 🚀

---

## ✅ Checklist Setelah Setup

- [ ] Supabase project dibuat
- [ ] SQL schema berhasil dijalankan (semua tabel ada)
- [ ] Storage bucket `uploads` dibuat dan public
- [ ] Akun admin dibuat dan role = 'admin'
- [ ] `.env.local` diisi dengan API keys
- [ ] `npm run dev` berjalan di localhost:3000
- [ ] Login dengan akun admin berhasil
- [ ] Halaman home menampilkan produk
- [ ] Tambah ke keranjang dan checkout berhasil

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---|---|
| Halaman blank/error | Cek `.env.local` sudah diisi dengan benar |
| Login gagal | Pastikan Supabase Auth sudah aktif |
| Gambar tidak muncul | Pastikan bucket `uploads` sudah public |
| Admin tidak bisa akses | Pastikan role = 'admin' di tabel profiles |
| RLS error | Gunakan `createAdminClient` (service role) untuk operasi admin |
