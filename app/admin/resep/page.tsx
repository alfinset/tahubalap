import { createDirectAdminClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/utils/format";
import Link from "next/link";
import DeleteResepButton from "@/components/admin/DeleteResepButton";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kelola Resep" };
interface Props { searchParams: Promise<{ search?: string }> }

export default async function AdminResepPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createDirectAdminClient();
  const { data: allReseps } = await supabase.from("reseps").select("*").order("id");

  const q = params.search?.toLowerCase() ?? "";
  const reseps = q
    ? (allReseps ?? []).filter((r: any) =>
        r.nama?.toLowerCase().includes(q) ||
        r.badge?.toLowerCase().includes(q) ||
        r.level?.toLowerCase().includes(q) ||
        (r.aktif ? "aktif" : "nonaktif").includes(q)
      )
    : (allReseps ?? []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>
          Kelola Resep
          {q && <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>({reseps.length} hasil)</span>}
        </h1>
        <Link href="/admin/resep/create" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#FF5C00", color: "white", fontWeight: 800, fontSize: 13, borderRadius: 12, textDecoration: "none" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Tambah Resep
        </Link>
      </div>

      <AdminSearchForm defaultValue={params.search ?? ""} basePath="/admin/resep" placeholder="Cari nama resep, badge, level, status..." />

      {reseps.length === 0 ? (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 48, textAlign: "center", color: "#9ca3af" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
          <p style={{ fontWeight: 700 }}>{q ? `Tidak ada hasil untuk "${q}"` : "Belum ada resep"}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {reseps.map((r: any) => (
            <div key={r.id} style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
              <div style={{ height: 140, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {r.gambar ? <img src={getStorageUrl(r.gambar) ?? ""} alt={r.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 48 }}>{r.emoji ?? "🧀"}</span>}
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#1f2937", margin: "0 0 4px" }}>{r.nama}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {r.badge && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: r.badge_color ?? "#FF5C00", color: "white" }}>{r.badge}</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.aktif ? "#16a34a" : "#9ca3af" }}>{r.aktif ? "Aktif" : "Nonaktif"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/resep/${r.id}/edit`} style={{ flex: 1, padding: "7px", background: "#eff6ff", color: "#3b82f6", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Edit</Link>
                  <Link href={`/resep/${r.slug}`} target="_blank" style={{ flex: 1, padding: "7px", background: "#f0fdf4", color: "#16a34a", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Preview</Link>
                  <DeleteResepButton id={r.id} nama={r.nama} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
