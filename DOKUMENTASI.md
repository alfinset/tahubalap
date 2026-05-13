# 📦 Dokumentasi Proyek: Toko Tahu — Next.js

> Direktori proyek: `C:\laragon\www\toko-tahu\nextjs`  
> Dibuat: Mei 2026 | Framework: Next.js 16.2.6 (App Router)

---

## 🗺️ Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Tech Stack & Dependensi](#tech-stack--dependensi)
3. [Struktur Direktori](#struktur-direktori)
4. [Routing & Halaman](#routing--halaman)
5. [Komponen](#komponen)
6. [Library & Utilitas](#library--utilitas)
7. [Tipe Data (TypeScript)](#tipe-data-typescript)
8. [Database & Supabase](#database--supabase)
9. [Autentikasi & Keamanan](#autentikasi--keamanan)
10. [Konfigurasi Proyek](#konfigurasi-proyek)

---

## Gambaran Umum

**Toko Tahu** adalah aplikasi e-commerce tahu berbasis web yang dibangun menggunakan Next.js App Router dengan Supabase sebagai backend-as-a-service. Aplikasi ini memiliki dua sisi utama:

- **Sisi Publik & Customer**: halaman belanja, detail produk, resep, keranjang, checkout, riwayat pesanan
- **Sisi Admin**: dashboard analitik, manajemen produk/kategori/resep/pesanan/user, pengaturan toko, notifikasi

---

## Tech Stack & Dependensi

### Runtime & Framework
| Paket | Versi | Fungsi |
|-------|-------|--------|
| `next` | 16.2.6 | Framework React (App Router, Server Components, Server Actions) |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | DOM rendering |
| `typescript` | ^5 | Type safety |

### Backend / Database
| Paket | Versi | Fungsi |
|-------|-------|--------|
| `@supabase/supabase-js` | ^2.105.4 | Supabase client utama (DB, Auth, Storage, Realtime) |
| `@supabase/ssr` | ^0.10.3 | Supabase SSR helper untuk Next.js (cookie-based auth) |

### State Management & UI
| Paket | Versi | Fungsi |
|-------|-------|--------|
| `zustand` | ^5.0.13 | Global state management untuk keranjang belanja |
| `lucide-react` | ^1.14.0 | Icon library |
| `tailwindcss` | ^4 | Utility CSS framework |

### Dev Tools
| Paket | Fungsi |
|-------|--------|
| `eslint` + `eslint-config-next` | Linting kode |
| `babel-plugin-react-compiler` | Optimasi React compiler |
| `@tailwindcss/postcss` | PostCSS integration untuk Tailwind v4 |

---

## Struktur Direktori

```
nextjs/
├── app/                          # App Router — semua route ada di sini
│   ├── layout.tsx                # Root layout (font, metadata global)
│   ├── globals.css               # CSS global + Tailwind base styles
│   ├── (public)/                 # Route group: halaman publik (tanpa auth)
│   │   ├── layout.tsx            # Layout publik (Navbar + Footer)
│   │   ├── page.tsx              # Halaman Beranda (/)
│   │   ├── produk/               # Katalog & detail produk
│   │   └── resep/                # Daftar & detail resep
│   ├── (customer)/               # Route group: halaman yang butuh login customer
│   │   ├── layout.tsx            # Layout customer (Navbar + Footer + Realtime)
│   │   ├── keranjang/            # Halaman keranjang belanja
│   │   ├── checkout/             # Halaman checkout & pembayaran
│   │   └── pesanan/              # Riwayat & detail pesanan customer
│   ├── admin/                    # Route group: panel admin
│   │   ├── layout.tsx            # Layout admin (Sidebar + Realtime)
│   │   ├── page.tsx              # Redirect ke /admin/dashboard
│   │   ├── dashboard/            # Halaman dashboard utama
│   │   ├── produk/               # CRUD produk + Server Actions
│   │   ├── kategori/             # CRUD kategori
│   │   ├── resep/                # CRUD resep
│   │   ├── pesanan/              # Manajemen pesanan
│   │   ├── user/                 # Manajemen user/profil
│   │   ├── setting/              # Pengaturan toko
│   │   └── notifikasi/           # Notifikasi admin
│   ├── login/                    # Halaman login
│   ├── register/                 # Halaman registrasi
│   └── auth/                     # Supabase auth callback handler
│
├── components/                   # Komponen React yang dapat dipakai ulang
│   ├── RealtimeRefresher.tsx     # Komponen Supabase Realtime auto-refresh
│   ├── admin/                    # Komponen khusus admin
│   ├── layout/                   # Komponen layout (Navbar, Footer, Sidebar)
│   ├── pesanan/                  # Komponen halaman pesanan customer
│   └── produk/                   # Komponen halaman produk customer
│
├── lib/                          # Logic non-komponen
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   └── server.ts             # Supabase server clients (SSR + service role)
│   ├── store/
│   │   └── keranjang.ts          # Zustand store untuk keranjang
│   └── utils/
│       └── format.ts             # Helper: format rupiah, tanggal, URL storage
│
├── types/
│   └── index.ts                  # Semua TypeScript type & interface
│
├── supabase/
│   ├── schema.sql                # SQL schema lengkap (tabel, RLS, fungsi)
│   └── storage_policy.sql        # Policy Supabase Storage
│
├── public/                       # Asset statis (gambar, favicon)
├── .env.local                    # Environment variables (tidak di-commit ke git)
├── next.config.ts                # Konfigurasi Next.js
├── tailwind.config.ts            # Konfigurasi Tailwind CSS
├── proxy.ts                      # Proxy server untuk development
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## Routing & Halaman

### Halaman Publik `(public)`

| Route | File | Deskripsi |
|-------|------|-----------|
| `/` | `(public)/page.tsx` | Beranda — hero section, produk unggulan, resep, info toko (data dari Supabase `settings`) |
| `/produk` | `(public)/produk/page.tsx` | Katalog semua produk aktif, filter kategori |
| `/produk/[slug]` | `(public)/produk/[slug]/page.tsx` | Detail produk — deskripsi, harga, tombol tambah keranjang |
| `/resep` | `(public)/resep/page.tsx` | Daftar semua resep aktif |
| `/resep/[slug]` | `(public)/resep/[slug]/page.tsx` | Detail resep — bahan-bahan, langkah memasak |

### Halaman Customer `(customer)` *(perlu login)*

| Route | File | Deskripsi |
|-------|------|-----------|
| `/keranjang` | `(customer)/keranjang/page.tsx` | Keranjang belanja — list item, ubah jumlah, hapus, summary harga |
| `/checkout` | `(customer)/checkout/page.tsx` | Form checkout — alamat, telepon, catatan, metode bayar (Transfer/COD) |
| `/pesanan` | `(customer)/pesanan/page.tsx` | Riwayat pesanan customer |
| `/pesanan/[kode]` | `(customer)/pesanan/[kode]/page.tsx` | Detail pesanan — status, pembayaran, upload bukti transfer |

### Halaman Admin `/admin` *(perlu login admin)*

| Route | File | Deskripsi |
|-------|------|-----------|
| `/admin/dashboard` | `admin/dashboard/page.tsx` | Dashboard — stat cards, grafik pendapatan real, best seller, stok menipis |
| `/admin/produk` | `admin/produk/page.tsx` | Daftar semua produk (aktif + nonaktif) + search |
| `/admin/produk/create` | `admin/produk/create/page.tsx` | Form tambah produk baru |
| `/admin/produk/[id]/edit` | `admin/produk/[id]/edit/page.tsx` | Form edit produk + upload gambar |
| `/admin/kategori` | `admin/kategori/page.tsx` | CRUD kategori (tambah, edit, hapus) + search |
| `/admin/resep` | `admin/resep/page.tsx` | Daftar resep + search |
| `/admin/resep/create` | `admin/resep/create/page.tsx` | Form tambah resep |
| `/admin/resep/[id]/edit` | `admin/resep/[id]/edit/page.tsx` | Form edit resep |
| `/admin/pesanan` | `admin/pesanan/page.tsx` | Daftar pesanan + filter status + search semua kolom |
| `/admin/pesanan/[id]` | `admin/pesanan/[id]/page.tsx` | Detail pesanan — info customer, pembayaran, update status |
| `/admin/user` | `admin/user/page.tsx` | Daftar semua profil user + search |
| `/admin/user/[id]` | `admin/user/[id]/page.tsx` | Detail profil user + riwayat pesanannya |
| `/admin/setting` | `admin/setting/page.tsx` | Pengaturan toko (nama, deskripsi, hero image, dll) |
| `/admin/notifikasi` | `admin/notifikasi/page.tsx` | Notifikasi pesanan baru + tandai sudah dibaca |

### Halaman Autentikasi

| Route | File | Deskripsi |
|-------|------|-----------|
| `/login` | `app/login/page.tsx` | Form login email + password |
| `/register` | `app/register/page.tsx` | Form registrasi akun customer baru |
| `/auth/callback` | `app/auth/callback/route.ts` | Handler OAuth callback dari Supabase |

---

## Komponen

### `components/RealtimeRefresher.tsx`
**Client Component** — subscribe ke Supabase Realtime WebSocket dan memanggil `router.refresh()` secara otomatis saat ada perubahan data di tabel yang dipantau. Dipakai di layout admin dan customer agar semua perangkat/tab sync tanpa refresh manual.

```tsx
<RealtimeRefresher tables={["pesanans", "notifications", "produks"]} debounceMs={500} />
```

---

### `components/layout/`

#### `AdminSidebar.tsx`
**Client Component** — sidebar navigasi admin panel.
- Menu navigasi ke semua halaman admin
- Badge 🔴 merah di menu "Pesanan" jika ada notifikasi belum dibaca
- Badge angka di menu "Notifikasi" dengan jumlah unread count
- Realtime subscription ke tabel `notifications` untuk update badge otomatis
- Tombol logout

#### `Navbar.tsx`
**Client Component** — navigasi halaman publik & customer.
- Link ke Beranda, Produk, Resep
- Ikon keranjang belanja dengan badge jumlah item (dari Zustand store)
- Menu user (login/profil/logout) jika sudah masuk

#### `Footer.tsx`
**Server/Client Component** — footer halaman publik dengan informasi toko.

---

### `components/admin/`

| Komponen | Tipe | Fungsi |
|----------|------|--------|
| `AdminSearchForm.tsx` | Client | Form pencarian reusable untuk semua halaman admin. Input teks + clear button + push URL dengan query param `search=` |
| `PesananSearchForm.tsx` | Client | Search form khusus halaman pesanan (mempertahankan filter status saat cari) |
| `ProdukForm.tsx` | Client | Form tambah/edit produk — nama, harga, stok, kategori, satuan, deskripsi, gambar (upload ke Supabase Storage), checkbox aktif |
| `ResepForm.tsx` | Client | Form tambah/edit resep — nama, badge, waktu masak, level, bahan (list dinamis), langkah (list dinamis), tips, gambar, checkbox aktif |
| `KategoriCRUD.tsx` | Client | Inline CRUD kategori — form tambah/edit di kiri, tabel list di kanan. Menerima prop `searchQuery` untuk pesan "tidak ada hasil" |
| `AdminSettingForm.tsx` | Client | Form pengaturan toko — nama toko, deskripsi, jam buka, alamat, upload gambar hero. Preview gambar langsung |
| `DeleteProdukButton.tsx` | Client | Tombol hapus produk dengan konfirmasi dialog. Panggil Server Action `hapusProduk` |
| `DeleteResepButton.tsx` | Client | Tombol hapus resep dengan konfirmasi. Panggil Server Action `hapusResep` |
| `NotifikasiActions.tsx` | Client | Tombol "Tandai Semua Dibaca" di halaman notifikasi |
| `PeriodeFilter.tsx` | Client | Toggle filter 7 hari / 30 hari di grafik dashboard |
| `UpdateStatusForm.tsx` | Client | Form update status pesanan (menunggu→diproses→dikirim→selesai) dan konfirmasi pembayaran |

---

### `components/pesanan/`

| Komponen | Fungsi |
|----------|--------|
| `UploadBuktiForm.tsx` | Form upload foto bukti transfer bank untuk pesanan metode transfer |

### `components/produk/`

| Komponen | Fungsi |
|----------|--------|
| `TambahKeranjangButton.tsx` | Tombol "Tambah ke Keranjang" di halaman detail produk. Menambahkan item ke Zustand store |

---

## Library & Utilitas

### `lib/supabase/client.ts`
Membuat Supabase **browser client** menggunakan anon key. Dipakai di Client Components (`"use client"`) untuk operasi yang menggunakan session cookie user (query data, auth, dsb).

```ts
// Pakai di Client Component
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
```

### `lib/supabase/server.ts`
Tiga fungsi client untuk sisi server:

| Fungsi | Kunci | Dipakai untuk |
|--------|-------|---------------|
| `createClient()` | Anon key + cookies | Server Components biasa — membaca data dengan session user |
| `createAdminClient()` | Service Role + cookies | Admin operations yang butuh bypass RLS tapi masih perlu session context |
| `createDirectAdminClient()` | Service Role **tanpa** cookies | **Operasi admin murni** — query semua data tanpa batasan RLS. Dipakai di semua halaman admin |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` memberikan akses superuser penuh. Hanya dipakai server-side, tidak pernah terekspos ke browser.

### `lib/store/keranjang.ts`
**Zustand store** untuk keranjang belanja yang persisten di `localStorage`.

| Method | Fungsi |
|--------|--------|
| `tambah(item)` | Tambah item ke keranjang (atau tambah jumlah jika sudah ada) |
| `update(id, jumlah)` | Update jumlah item; jika jumlah ≤ 0 maka hapus |
| `hapus(id)` | Hapus item dari keranjang |
| `kosongkan()` | Kosongkan seluruh keranjang |
| `total()` | Hitung total harga semua item |
| `totalItem()` | Hitung total jumlah item |
| `hydrateFromStorage()` | Muat ulang data dari localStorage (dipanggil saat komponen mount) |

### `lib/utils/format.ts`
Kumpulan helper function:

| Fungsi | Output |
|--------|--------|
| `formatRupiah(amount)` | `"Rp 15.000"` |
| `formatTanggal(date)` | `"14 Mei 2026"` |
| `formatTanggalSingkat(date)` | `"14 Mei, 03:24"` |
| `truncate(text, max)` | Potong teks dengan `"..."` |
| `generateKodePesanan()` | `"TH-A1B2C3D4"` — kode unik pesanan |
| `getStatusStyle(status)` | `{ bg, text, label }` — Tailwind class untuk badge status |
| `getStorageUrl(path)` | URL lengkap Supabase Storage dari path relatif |

---

## Tipe Data (TypeScript)

File: `types/index.ts`

| Interface | Tabel DB | Deskripsi |
|-----------|----------|-----------|
| `Profile` | `profiles` | Data profil user (nama, email, role, telepon, alamat) |
| `Kategori` | `kategoris` | Kategori produk (nama, slug, deskripsi) |
| `Produk` | `produks` | Data produk (nama, harga, stok, gambar, satuan, aktif, relasi kategori) |
| `Pesanan` | `pesanans` | Header pesanan (kode, total, status, alamat, relasi user/detail/pembayaran) |
| `DetailPesanan` | `detail_pesanans` | Item dalam pesanan (produk, jumlah, harga satuan, subtotal) |
| `Pembayaran` | `pembayarans` | Data pembayaran (metode, bukti, status konfirmasi) |
| `Resep` | `reseps` | Resep masak (bahan, langkah, tips, gambar — bahan/langkah disimpan JSON string) |
| `Setting` | `settings` | Key-value pengaturan toko |
| `Notification` | `notifications` | Notifikasi admin (type, data JSON, read_at) |
| `KeranjangItem` | *(localStorage)* | Item keranjang belanja client-side |

---

## Database & Supabase

### Tabel Utama

```
profiles          → Data profil user (dibuat otomatis saat register via trigger)
kategoris         → Kategori produk
produks           → Produk tahu (link ke kategoris)
pesanans          → Header pesanan customer
detail_pesanans   → Item dalam setiap pesanan (link ke pesanans + produks)
pembayarans       → Pembayaran per pesanan (COD/transfer, bukti, status)
reseps            → Resep masak berbahan tahu
settings          → Key-value pengaturan toko dinamis
notifications     → Notifikasi admin (pesanan baru, dsb)
```

### Server Actions (`app/admin/produk/actions.ts`)

Semua operasi tulis (INSERT/UPDATE/DELETE) dilakukan melalui **Server Actions** menggunakan `getAdminClient()` (service role) agar bypass RLS:

| Action | Fungsi |
|--------|--------|
| `simpanProduk(id?, payload)` | Tambah / update produk |
| `hapusProduk(id)` | Hapus produk + gambar dari storage |
| `uploadGambarProduk(formData)` | Upload gambar ke Supabase Storage bucket `uploads/produk/` |
| `simpanKategori(id?, payload)` | Tambah / update kategori |
| `hapusKategori(id)` | Hapus kategori |
| `simpanResep(id?, payload)` | Tambah / update resep |
| `hapusResep(id)` | Hapus resep |
| `simpanSetting(key, value)` | Update satu setting toko |
| `updateStatusPesanan(id, status)` | Update status pesanan |
| `konfirmasiBayar(pesananId)` | Konfirmasi pembayaran oleh admin |
| `uploadBuktiPembayaran(id, total, path)` | Customer upload bukti transfer |
| `kirimNotifikasiPesananBaru(payload)` | Kirim notif ke semua admin saat ada pesanan baru |

### Supabase Storage

Bucket: **`uploads`** (public)
- `uploads/produk/` — gambar produk
- `uploads/resep/` — gambar resep
- `uploads/hero/` — gambar hero beranda
- `uploads/bukti/` — bukti transfer pembayaran

### Supabase Realtime

Diaktifkan pada tabel: `pesanans`, `notifications`, `produks`, `kategoris`, `reseps`, `profiles`

Komponen `RealtimeRefresher` subscribe ke perubahan tabel dan trigger `router.refresh()` agar data Server Components terupdate otomatis di semua perangkat.

---

## Autentikasi & Keamanan

### Alur Autentikasi
1. User register → Supabase Auth buat `auth.users` → trigger DB buat row di `profiles`
2. User login → Supabase set cookie session → middleware/server client baca cookie
3. Admin check: baca kolom `role` di tabel `profiles`

### Row Level Security (RLS)
- **Customer** hanya bisa baca/tulis data milik sendiri (pesanan, pembayaran)
- **Produk & kategori**: semua user bisa baca yang aktif; hanya admin yang bisa write
- **Profiles**: user hanya bisa baca/update profil sendiri
- **Bypass RLS**: semua operasi admin menggunakan `createDirectAdminClient()` dengan service role key yang hanya tersedia server-side

### Middleware
`middleware.ts` — melindungi route `/admin/*` agar hanya bisa diakses user dengan role `admin`.

---

## Konfigurasi Proyek

### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # RAHASIA — jangan expose ke client!
```

### `next.config.ts`
- Konfigurasi domain gambar untuk Supabase Storage
- Pengaturan Turbopack (dev server cepat)

### `tailwind.config.ts`
Tailwind v4 dengan design token kustom:
- Warna `primary` (oranye tahu): `#FF5C00`
- Warna `surface`, `on-surface`, `outline-variant` untuk komponen customer

### `proxy.ts`
Script proxy development untuk menangani request di environment Laragon.

### `supabase/schema.sql`
SQL lengkap untuk:
- Membuat semua tabel dengan foreign key
- Mendefinisikan RLS policies
- Trigger otomatis buat profil user saat register
- Function `kurangi_stok` (RPC untuk kurangi stok produk saat checkout)

---

*Dokumentasi ini dibuat otomatis berdasarkan analisis kode sumber — Mei 2026*
