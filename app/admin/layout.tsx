import AdminSidebar from "@/components/layout/AdminSidebar";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin Panel", template: "%s | Admin Tahu Balap" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minWidth: 0 }}>
        {/* Auto-refresh saat ada perubahan di DB (pesanan, produk, kategori, dll) */}
        <RealtimeRefresher tables={["pesanans", "notifications", "produks", "kategoris", "reseps", "profiles"]} />
        {children}
      </main>
    </div>
  );
}
