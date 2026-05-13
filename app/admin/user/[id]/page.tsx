import { createDirectAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatTanggal } from "@/lib/utils/format";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Detail User" };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createDirectAdminClient();
  const [{ data: user }, { data: pesanans }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("pesanans").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);
  if (!user) notFound();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Detail User</h1>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FFE4D6", color: "#FF5C00", fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {(user.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <p style={{ textAlign: "center", fontWeight: 900, fontSize: 18, color: "#1f2937", margin: "0 0 4px" }}>{user.name}</p>
          <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>{user.email}</p>
          <span style={{ display: "block", textAlign: "center", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 20, background: user.role === "admin" ? "#fff7ed" : "#f0fdf4", color: user.role === "admin" ? "#FF5C00" : "#16a34a" }}>
            {user.role.toUpperCase()}
          </span>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>Bergabung</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{formatTanggal(user.created_at)}</p>
            {user.telepon && <><p style={{ fontSize: 12, color: "#9ca3af", margin: "12px 0 6px" }}>Telepon</p><p style={{ fontSize: 14, fontWeight: 700 }}>{user.telepon}</p></>}
            {user.alamat && <><p style={{ fontSize: 12, color: "#9ca3af", margin: "12px 0 6px" }}>Alamat</p><p style={{ fontSize: 14, fontWeight: 700 }}>{user.alamat}</p></>}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: 0 }}>Riwayat Pesanan ({pesanans?.length ?? 0})</h2>
          </div>
          {(!pesanans || pesanans.length === 0) ? (
            <p style={{ padding: 24, color: "#9ca3af", textAlign: "center" }}>Belum ada pesanan</p>
          ) : pesanans.map((p: any) => (
            <div key={p.id} style={{ padding: "16px 24px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>#{p.kode_pesanan}</span>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{formatTanggal(p.created_at)}</span>
              <span style={{ fontWeight: 800, color: "#FF5C00" }}>Rp{p.total_harga.toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
