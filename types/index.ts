export type UserRole = "admin" | "customer";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  telepon?: string;
  alamat?: string;
  created_at: string;
}

export interface Kategori {
  id: number;
  nama: string;
  slug: string;
  deskripsi?: string;
  created_at: string;
}

export interface Produk {
  id: number;
  kategori_id?: number;
  nama: string;
  slug: string;
  deskripsi?: string;
  harga: number;
  stok: number;
  gambar?: string;
  satuan: string;
  aktif: boolean;
  created_at: string;
  updated_at: string;
  kategori?: Kategori;
}

export interface Pesanan {
  id: number;
  user_id: string;
  kode_pesanan: string;
  total_harga: number;
  ongkos_kirim: number;
  status: "menunggu" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
  alamat_pengiriman: string;
  telepon: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  detail_pesanans?: DetailPesanan[];
  pembayaran?: Pembayaran;
}

export interface DetailPesanan {
  id: number;
  pesanan_id: number;
  produk_id?: number;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  created_at: string;
  produk?: Produk;
}

export interface Pembayaran {
  id: number;
  pesanan_id: number;
  metode_bayar: "cod" | "transfer";
  jumlah_bayar?: number;
  bukti_transfer?: string;
  status: "menunggu" | "dikonfirmasi" | "ditolak";
  tanggal_bayar?: string;
  created_at: string;
}

export interface Resep {
  id: number;
  nama: string;
  slug: string;
  kategori?: string;
  badge?: string;
  badge_color?: string;
  emoji?: string;
  waktu?: string;
  level?: string;
  harga?: number;
  deskripsi?: string;
  bahan?: string[];
  langkah?: string[];
  tips?: string;
  gambar?: string;
  aktif: boolean;
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// Keranjang (cart) item - disimpan di localStorage
export interface KeranjangItem {
  id: number;
  nama: string;
  harga: number;
  jumlah: number;
  gambar?: string;
  satuan: string;
}

export interface DashboardStats {
  total_pesanan: number;
  pesanan_hari_ini: number;
  total_produk: number;
  stok_menipis: number;
  total_customer: number;
  pendapatan_bulan: number;
}

export interface TrenData {
  label: string;
  tanggal: string;
  pendapatan: number;
  pesanan: number;
  is_today: boolean;
}
