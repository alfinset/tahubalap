"use client";
import { useKeranjang } from "@/lib/store/keranjang";
import { formatRupiah, getStorageUrl, generateKodePesanan } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { kirimNotifikasiPesananBaru } from "@/app/admin/produk/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, kosongkan } = useKeranjang();
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ alamat_pengiriman: "", telepon: "", catatan: "", metode_bayar: "transfer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ongkir = 5000;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <p className="font-bold text-on-surface mb-4">Keranjang Anda kosong</p>
        <Link href="/produk" className="text-primary-container font-bold hover:underline">Kembali belanja</Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login?redirect=/checkout"); return; }

    const kode = generateKodePesanan();
    const totalHarga = total() + ongkir;

    const { data: pesanan, error: pesErr } = await supabase.from("pesanans").insert({
      user_id: user.id, kode_pesanan: kode, total_harga: totalHarga,
      ongkos_kirim: ongkir, status: "menunggu",
      alamat_pengiriman: form.alamat_pengiriman,
      telepon: form.telepon, catatan: form.catatan,
    }).select().single();

    if (pesErr || !pesanan) { setError("Gagal membuat pesanan."); setLoading(false); return; }

    // Insert detail pesanan
    await supabase.from("detail_pesanans").insert(
      items.map((item) => ({
        pesanan_id: pesanan.id, produk_id: item.id,
        jumlah: item.jumlah, harga_satuan: item.harga,
        subtotal: item.harga * item.jumlah,
      }))
    );

    // Kurangi stok
    for (const item of items) {
      await supabase.rpc("kurangi_stok", { p_produk_id: item.id, p_jumlah: item.jumlah });
    }

    // Pembayaran COD
    if (form.metode_bayar === "cod") {
      await supabase.from("pembayarans").insert({
        pesanan_id: pesanan.id, metode_bayar: "cod",
        jumlah_bayar: totalHarga, status: "menunggu",
        tanggal_bayar: new Date().toISOString(),
      });
    }

    // Notifikasi admin via Server Action (bypass RLS dengan service role)
    await kirimNotifikasiPesananBaru({
      kode_pesanan: kode,
      total_harga: totalHarga,
      customer_email: user.email ?? "",
    });

    kosongkan();
    router.push(`/pesanan/${kode}?sukses=1`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-headline-md font-black text-on-surface mb-8">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleCheckout} className="md:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
          )}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-5">
            <h2 className="font-black text-on-surface">Info Pengiriman</h2>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Alamat Pengiriman *</label>
              <textarea required rows={3} value={form.alamat_pengiriman}
                onChange={(e) => setForm({ ...form, alamat_pengiriman: e.target.value })}
                placeholder="Masukkan alamat lengkap..."
                className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Nomor Telepon *</label>
              <input required type="tel" value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Catatan (opsional)</label>
              <textarea rows={2} value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Catatan untuk penjual..."
                className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant p-6">
            <h2 className="font-black text-on-surface mb-5">Metode Pembayaran</h2>
            <div className="space-y-3">
              {[
                { value: "transfer", icon: "account_balance", label: "Transfer Bank", desc: "Upload bukti transfer setelah pesanan dibuat" },
                { value: "cod", icon: "local_shipping", label: "COD (Bayar di Tempat)", desc: "Bayar tunai saat kurir tiba" },
              ].map((m) => (
                <label key={m.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.metode_bayar === m.value ? "border-primary-container bg-primary-fixed" : "border-outline-variant hover:border-primary-container/50"}`}>
                  <input type="radio" name="metode_bayar" value={m.value} checked={form.metode_bayar === m.value}
                    onChange={(e) => setForm({ ...form, metode_bayar: e.target.value })} className="hidden" />
                  <span className={`material-symbols-outlined ${form.metode_bayar === m.value ? "text-primary-container" : "text-on-surface-variant"}`}>{m.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{m.label}</p>
                    <p className="text-xs text-on-surface-variant">{m.desc}</p>
                  </div>
                  {form.metode_bayar === m.value && (
                    <span className="material-symbols-outlined text-primary-container ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary-container text-white font-black py-4 rounded-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {loading ? "Memproses..." : "Buat Pesanan"}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-sm h-fit sticky top-20">
          <h2 className="font-black text-on-surface mb-5">Ringkasan</h2>
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.gambar ? <img src={getStorageUrl(item.gambar) ?? ""} alt={item.nama} className="w-full h-full object-cover" /> : <span className="text-lg">🧀</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">{item.nama}</p>
                  <p className="text-xs text-on-surface-variant">x{item.jumlah}</p>
                </div>
                <p className="text-xs font-black text-on-surface">{formatRupiah(item.harga * item.jumlah)}</p>
              </div>
            ))}
          </div>
          <hr className="border-outline-variant mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-on-surface-variant"><span>Subtotal</span><span className="font-bold text-on-surface">{formatRupiah(total())}</span></div>
            <div className="flex justify-between text-on-surface-variant"><span>Ongkir</span><span className="font-bold text-on-surface">{formatRupiah(ongkir)}</span></div>
            <hr className="border-outline-variant" />
            <div className="flex justify-between font-black text-on-surface text-base">
              <span>Total</span><span className="text-primary-container">{formatRupiah(total() + ongkir)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
