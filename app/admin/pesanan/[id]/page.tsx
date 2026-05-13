import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal, getStatusStyle, getStorageUrl } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import UpdateStatusForm from "@/components/admin/UpdateStatusForm";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Detail Pesanan Admin" };

export default async function AdminPesananDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createDirectAdminClient();
  const { data: pesanan } = await supabase
    .from("pesanans")
    .select("*, user:profiles(name, email, telepon, alamat), detail_pesanans(*, produk:produks(nama, gambar, satuan)), pembayaran:pembayarans(*)")
    .eq("id", id).single();
  if (!pesanan) notFound();
  const st = getStatusStyle(pesanan.status);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>#{pesanan.kode_pesanan}</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>{formatTanggal(pesanan.created_at)}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, padding: "8px 20px", borderRadius: 20 }} className={`${st.bg} ${st.text}`}>{st.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Info Customer */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 16px" }}>Info Customer</h2>
          {[["Nama", pesanan.user?.name], ["Email", pesanan.user?.email], ["Telepon", pesanan.telepon], ["Alamat Pengiriman", pesanan.alamat_pengiriman], ["Catatan", pesanan.catatan]].map(([label, val]) => val ? (
            <div key={label} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: 13, color: "#1f2937", fontWeight: 600, margin: 0 }}>{val}</p>
            </div>
          ) : null)}
        </div>

        {/* Info Pembayaran */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 16px" }}>Info Pembayaran</h2>
          {pesanan.pembayaran ? (
            <>
              {[["Metode", pesanan.pembayaran.metode_bayar === "cod" ? "COD" : "Transfer Bank"], ["Jumlah", formatRupiah(pesanan.pembayaran.jumlah_bayar)], ["Status Bayar", getStatusStyle(pesanan.pembayaran.status).label]].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: 13, color: "#1f2937", fontWeight: 600, margin: 0 }}>{val}</p>
                </div>
              ))}
              {pesanan.pembayaran.bukti_transfer && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", margin: "0 0 8px" }}>Bukti Transfer</p>
                  <img src={getStorageUrl(pesanan.pembayaran.bukti_transfer) ?? ""} alt="Bukti" style={{ width: "100%", borderRadius: 12, border: "1px solid #f3f4f6" }} />
                </div>
              )}
              {/* Tampilkan tombol konfirmasi bayar jika status masih menunggu */}
              {pesanan.pembayaran.status === "menunggu" && (
                <UpdateStatusForm pesananId={Number(id)} type="bayar" />
              )}
            </>
          ) : <p style={{ fontSize: 13, color: "#9ca3af" }}>Belum ada data pembayaran</p>}
        </div>
      </div>

      {/* Detail Produk */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 16px" }}>Detail Produk</h2>
        {pesanan.detail_pesanans?.map((d: any) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #f9fafb" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {d.produk?.gambar ? <img src={getStorageUrl(d.produk.gambar) ?? ""} alt={d.produk?.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🧀</span>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{d.produk?.nama ?? "Produk dihapus"}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{formatRupiah(d.harga_satuan)} × {d.jumlah} {d.produk?.satuan}</p>
            </div>
            <p style={{ fontWeight: 900, fontSize: 14, color: "#1f2937" }}>{formatRupiah(d.subtotal)}</p>
          </div>
        ))}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#6b7280" }}>
            <span>Subtotal</span><span style={{ fontWeight: 700, color: "#1f2937" }}>{formatRupiah(pesanan.total_harga - pesanan.ongkos_kirim)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#6b7280" }}>
            <span>Ongkos Kirim</span><span style={{ fontWeight: 700, color: "#1f2937" }}>{formatRupiah(pesanan.ongkos_kirim)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900 }}>
            <span>Total</span><span style={{ color: "#FF5C00" }}>{formatRupiah(pesanan.total_harga)}</span>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 16px" }}>Update Status Pesanan</h2>
        <UpdateStatusForm pesananId={Number(id)} currentStatus={pesanan.status} type="status" />
      </div>
    </div>
  );
}
