import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatTanggal } from "@/lib/utils/format";
import Link from "next/link";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kelola User" };
interface Props { searchParams: Promise<{ search?: string }> }

export default async function AdminUserPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createDirectAdminClient();
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const q = params.search?.toLowerCase() ?? "";
  const users = q
    ? (allUsers ?? []).filter((u: any) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.telepon?.toLowerCase().includes(q) ||
        u.alamat?.toLowerCase().includes(q)
      )
    : (allUsers ?? []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>
          Kelola User
          <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>
            ({users.length}{q ? ` hasil` : ` user`})
          </span>
        </h1>
      </div>

      <AdminSearchForm defaultValue={params.search ?? ""} basePath="/admin/user" placeholder="Cari nama, email, role, telepon, alamat..." />

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["User", "Email", "Role", "Telepon", "Bergabung", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                <p style={{ fontWeight: 700 }}>{q ? `Tidak ada hasil untuk "${q}"` : "Belum ada user"}</p>
              </td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.role === "admin" ? "#FF5C00" : "#FFE4D6", color: u.role === "admin" ? "white" : "#FF5C00", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {(u.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{u.name ?? "-"}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>{u.email}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: u.role === "admin" ? "#fff7ed" : "#f0fdf4", color: u.role === "admin" ? "#FF5C00" : "#16a34a" }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>{u.telepon ?? "-"}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>{formatTanggal(u.created_at)}</td>
                <td style={{ padding: "14px 16px" }}>
                  <Link href={`/admin/user/${u.id}`} style={{ color: "#FF5C00", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
