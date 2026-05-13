import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatRupiah, getStorageUrl } from "@/lib/utils/format";
import Link from "next/link";
import DeleteProdukButton from "@/components/admin/DeleteProdukButton";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Produk" };
interface Props { searchParams: Promise<{ search?: string }> }

export default async function AdminProdukPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createDirectAdminClient();

  let query = supabase.from("produks").select("*, kategori:kategoris(nama)").order("id");
  const allProduks = (await query).data ?? [];

  // Filter di JS agar bisa cari di semua kolom termasuk relasi
  const q = params.search?.toLowerCase() ?? "";
  const produks = q
    ? allProduks.filter((p: any) =>
        p.nama?.toLowerCase().includes(q) ||
        p.kategori?.nama?.toLowerCase().includes(q) ||
        p.harga?.toString().includes(q) ||
        p.stok?.toString().includes(q) ||
        (p.aktif ? "aktif" : "nonaktif").includes(q)
      )
    : allProduks;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>
          Kelola Produk
          {produks.length > 0 && params.search && (
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>({produks.length} hasil)</span>
          )}
        </h1>
        <Link href="/admin/produk/create"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#FF5C00", color: "white", fontWeight: 800, fontSize: 13, borderRadius: 12, textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Tambah Produk
        </Link>
      </div>

      <AdminSearchForm defaultValue={params.search ?? ""} basePath="/admin/produk" placeholder="Cari nama, kategori, harga, stok, status..." />

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Produk", "Kategori", "Harga", "Stok", "Status", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produks.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <p style={{ fontWeight: 700 }}>{params.search ? `Tidak ada hasil untuk "${params.search}"` : "Belum ada produk"}</p>
              </td></tr>
            ) : produks.map((p: any) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fff7ed", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.gambar ? <img src={getStorageUrl(p.gambar) ?? ""} alt={p.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>🧀</span>}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, margin: 0, color: "#1f2937" }}>{p.nama}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>/{p.satuan}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{p.kategori?.nama ?? "-"}</td>
                <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 14, color: "#1f2937" }}>{formatRupiah(p.harga)}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: p.stok <= 10 ? "#ef4444" : "#1f2937" }}>{p.stok}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: p.aktif ? "#f0fdf4" : "#f3f4f6", color: p.aktif ? "#16a34a" : "#9ca3af" }}>
                    {p.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/admin/produk/${p.id}/edit`} style={{ padding: "6px 14px", background: "#eff6ff", color: "#3b82f6", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Edit</Link>
                    <DeleteProdukButton id={p.id} nama={p.nama} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
