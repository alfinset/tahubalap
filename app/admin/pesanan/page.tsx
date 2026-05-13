import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatRupiah, getStatusStyle, formatTanggalSingkat } from "@/lib/utils/format";
import Link from "next/link";
import PesananSearchForm from "@/components/admin/PesananSearchForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Pesanan" };
interface Props { searchParams: Promise<{ status?: string; search?: string }> }

export default async function AdminPesananPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createDirectAdminClient();

  let query = supabase
    .from("pesanans")
    .select("*, user:profiles(name, email), pembayaran:pembayarans(metode_bayar, status)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.search) {
    // Cari berdasarkan kode_pesanan atau nama customer
    query = query.or(`kode_pesanan.ilike.%${params.search}%`);
  }
  const { data: pesanans } = await query;

  // Filter tambahan by nama customer di JS (karena relasi profiles tidak bisa di-filter via .or() langsung)
  const filteredPesanans = params.search
    ? (pesanans ?? []).filter((p: any) =>
        p.kode_pesanan?.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.total_harga?.toString().includes(params.search!) ||
        p.status?.toLowerCase().includes(params.search!.toLowerCase())
      )
    : (pesanans ?? []);

  const statusList = ["semua", "menunggu", "diproses", "dikirim", "selesai", "dibatalkan"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>
          Kelola Pesanan
          {filteredPesanans.length > 0 && (
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>
              ({filteredPesanans.length} pesanan)
            </span>
          )}
        </h1>
      </div>

      {/* Search Form */}
      <PesananSearchForm defaultValue={params.search ?? ""} currentStatus={params.status} />

      {/* Filter Status */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {statusList.map((s) => {
          const active = (s === "semua" && !params.status) || s === params.status;
          const searchQuery = params.search ? `&search=${params.search}` : "";
          return (
            <Link key={s}
              href={s === "semua" ? `/admin/pesanan${params.search ? `?search=${params.search}` : ""}` : `/admin/pesanan?status=${s}${searchQuery}`}
              style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: "none", background: active ? "#FF5C00" : "#f3f4f6", color: active ? "white" : "#6b7280", transition: "all 0.15s" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          );
        })}
      </div>

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Kode Pesanan", "Customer", "Total", "Metode", "Status", "Tanggal", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPesanans.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 700 }}>
                  {params.search ? `Tidak ada hasil untuk "${params.search}"` : "Tidak ada pesanan"}
                </p>
              </td></tr>
            ) : filteredPesanans.map((p: any) => {
              const st = getStatusStyle(p.status);
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13, color: "#1f2937" }}>#{p.kode_pesanan}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{p.user?.name ?? "-"}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{p.user?.email}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 13 }}>{formatRupiah(p.total_harga)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{p.pembayaran?.metode_bayar?.toUpperCase() ?? "-"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20 }} className={`${st.bg} ${st.text}`}>{st.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>{formatTanggalSingkat(p.created_at)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/admin/pesanan/${p.id}`} style={{ color: "#FF5C00", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Detail</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
