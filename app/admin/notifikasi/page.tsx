import { createClient } from "@/lib/supabase/server";
import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatTanggalSingkat } from "@/lib/utils/format";
import NotifikasiActions from "@/components/admin/NotifikasiActions";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Notifikasi" };

export default async function AdminNotifikasiPage() {
  // Gunakan SSR client (pakai cookie) untuk mendapatkan user yang sedang login
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan direct admin client untuk query notifikasi (bypass RLS)
  const supabase = createDirectAdminClient();
  const { data: notifikasis } = await supabase
    .from("notifications").select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>Notifikasi</h1>
        <NotifikasiActions userId={user.id} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(!notifikasis || notifikasis.length === 0) ? (
          <div style={{ textAlign: "center", padding: 48, background: "white", borderRadius: 16, border: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p style={{ fontWeight: 700, color: "#9ca3af" }}>Tidak ada notifikasi</p>
          </div>
        ) : notifikasis.map((n: any) => {
          const data = n.data ?? {};
          const isUnread = !n.read_at;
          return (
            <div key={n.id} style={{ background: isUnread ? "#fff7ed" : "white", borderRadius: 16, border: `1px solid ${isUnread ? "#fed7aa" : "#f3f4f6"}`, padding: 20, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: isUnread ? "#FF5C00" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: isUnread ? "white" : "#9ca3af", fontSize: 22 }}>
                  {n.type === "pesanan_baru" ? "shopping_bag" : "notifications"}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#1f2937", margin: "0 0 4px" }}>
                  {n.type === "pesanan_baru" ? "Pesanan Baru Masuk!" : n.type}
                </p>
                {data.kode_pesanan && (
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 2px" }}>
                    Kode: <strong>#{data.kode_pesanan}</strong> — {data.customer}
                  </p>
                )}
                {data.total_harga && (
                  <p style={{ fontSize: 13, color: "#FF5C00", fontWeight: 700, margin: 0 }}>
                    Rp{Number(data.total_harga).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>{formatTanggalSingkat(n.created_at)}</p>
                {isUnread && <span style={{ fontSize: 10, fontWeight: 800, background: "#FF5C00", color: "white", padding: "2px 8px", borderRadius: 10 }}>BARU</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
