import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal, getStatusStyle, getStorageUrl } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import UploadBuktiForm from "@/components/pesanan/UploadBuktiForm";
import type { Metadata } from "next";

interface Props { params: Promise<{ kode: string }>; searchParams: Promise<{ sukses?: string }> }
export const metadata: Metadata = { title: "Detail Pesanan" };

export default async function PesananDetailPage({ params, searchParams }: Props) {
  const { kode } = await params;
  const { sukses } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pesanan } = await supabase
    .from("pesanans")
    .select("*, detail_pesanans(*, produk:produks(nama, gambar, satuan)), pembayaran:pembayarans(*)")
    .eq("kode_pesanan", kode).eq("user_id", user!.id).single();

  if (!pesanan) notFound();
  const s = getStatusStyle(pesanan.status);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {sukses && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="font-bold text-sm">Pesanan berhasil dibuat! {pesanan.pembayaran?.metode_bayar === "cod" ? "Siapkan uang saat kurir tiba." : "Silakan lakukan pembayaran transfer."}</p>
        </div>
      )}

      {/* Tombol Kembali */}
      <div className="mb-6">
        <a href="/pesanan" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-bold text-sm transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke Daftar Pesanan
        </a>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-headline-md font-black text-on-surface">#{pesanan.kode_pesanan}</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${s.bg} ${s.text}`}>{s.label}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Info Pengiriman */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6">
          <h2 className="font-black text-on-surface mb-4">Info Pengiriman</h2>
          <div className="space-y-3 text-sm">
            <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Alamat</p><p className="text-on-surface font-medium">{pesanan.alamat_pengiriman}</p></div>
            <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Telepon</p><p className="text-on-surface font-medium">{pesanan.telepon}</p></div>
            {pesanan.catatan && <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Catatan</p><p className="text-on-surface font-medium">{pesanan.catatan}</p></div>}
            <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Tanggal</p><p className="text-on-surface font-medium">{formatTanggal(pesanan.created_at)}</p></div>
          </div>
        </div>

        {/* Pembayaran */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6">
          <h2 className="font-black text-on-surface mb-4">Pembayaran</h2>
          {pesanan.pembayaran ? (
            <div className="space-y-3 text-sm">
              <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Metode</p>
                <p className="text-on-surface font-bold">{pesanan.pembayaran.metode_bayar === "cod" ? "COD (Bayar di Tempat)" : "Transfer Bank"}</p></div>
              <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Status Bayar</p>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyle(pesanan.pembayaran.status).bg} ${getStatusStyle(pesanan.pembayaran.status).text}`}>
                  {getStatusStyle(pesanan.pembayaran.status).label}
                </span>
              </div>
              {pesanan.pembayaran.bukti_transfer && (
                <div><p className="text-on-surface-variant text-xs font-bold uppercase mb-2">Bukti Transfer</p>
                  <img src={getStorageUrl(pesanan.pembayaran.bukti_transfer) ?? ""} alt="Bukti" className="w-full rounded-xl border border-outline-variant" /></div>
              )}
            </div>
          ) : (
            <p className="text-on-surface-variant text-sm">Belum ada data pembayaran</p>
          )}
        </div>
      </div>

      {/* Detail Produk */}
      <div className="bg-white rounded-2xl border border-outline-variant p-6 mb-6">
        <h2 className="font-black text-on-surface mb-5">Detail Produk</h2>
        <div className="space-y-4">
          {pesanan.detail_pesanans?.map((d: any) => (
            <div key={d.id} className="flex items-center gap-4 pb-4 border-b border-outline-variant last:border-0 last:pb-0">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0 overflow-hidden">
                {d.produk?.gambar ? <img src={getStorageUrl(d.produk.gambar) ?? ""} alt={d.produk?.nama} className="w-full h-full object-cover" /> : <span className="text-2xl">🧀</span>}
              </div>
              <div className="flex-1"><p className="font-bold text-sm text-on-surface">{d.produk?.nama ?? "Produk dihapus"}</p>
                <p className="text-xs text-on-surface-variant">{formatRupiah(d.harga_satuan)} x {d.jumlah}</p></div>
              <p className="font-black text-on-surface text-sm">{formatRupiah(d.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant space-y-2 text-sm">
          <div className="flex justify-between text-on-surface-variant"><span>Subtotal</span><span className="font-bold text-on-surface">{formatRupiah(pesanan.total_harga - pesanan.ongkos_kirim)}</span></div>
          <div className="flex justify-between text-on-surface-variant"><span>Ongkos Kirim</span><span className="font-bold text-on-surface">{formatRupiah(pesanan.ongkos_kirim)}</span></div>
          <div className="flex justify-between font-black text-on-surface text-base"><span>Total</span><span className="text-primary-container">{formatRupiah(pesanan.total_harga)}</span></div>
        </div>
      </div>

      {/* Upload Bukti Transfer */}
      {pesanan.status === "menunggu" && (!pesanan.pembayaran || pesanan.pembayaran.metode_bayar === "transfer") && !pesanan.pembayaran?.bukti_transfer && (
        <UploadBuktiForm kodePesanan={kode} pesananId={pesanan.id} totalHarga={pesanan.total_harga} />
      )}
    </div>
  );
}
