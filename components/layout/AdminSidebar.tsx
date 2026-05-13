"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const menuItems = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/produk", icon: "restaurant_menu", label: "Produk" },
  { href: "/admin/pesanan", icon: "receipt_long", label: "Pesanan" },
  { href: "/admin/kategori", icon: "category", label: "Kategori" },
  { href: "/admin/user", icon: "group", label: "User" },
  { href: "/admin/resep", icon: "menu_book", label: "Resep" },
  { href: "/admin/setting", icon: "settings", label: "Setting" },
  { href: "/admin/notifikasi", icon: "notifications", label: "Notifikasi" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [adminName, setAdminName] = useState("Admin");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let notifChannel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      if (profile) setAdminName(profile.name);

      // Fetch awal count notifikasi belum dibaca
      const fetchCount = async () => {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null);
        setUnreadCount(count ?? 0);
      };
      await fetchCount();

      // Subscribe realtime agar badge update otomatis
      notifChannel = supabase
        .channel(`notif-badge-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => fetchCount()
        )
        .subscribe();
    });

    return () => {
      if (notifChannel) supabase.removeChannel(notifChannel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "white",
        borderRight: "1px solid #f3f4f6",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "#FF5C00", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 20,
              }}
            >
              🏎️
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: "#1f2937", margin: 0 }}>Tahu Balap</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, fontWeight: 700 }}>ADMIN PANEL</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12, marginBottom: 4,
                textDecoration: "none", fontWeight: 700, fontSize: 14,
                transition: "all 0.15s",
                background: active ? "#fff7ed" : "transparent",
                color: active ? "#FF5C00" : "#6b7280",
                position: "relative",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {item.label}
              {item.label === "Notifikasi" && unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto", background: "#FF5C00", color: "white",
                    borderRadius: 20, fontSize: 10, fontWeight: 900,
                    padding: "2px 7px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
              {item.label === "Pesanan" && unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "auto", width: 8, height: 8,
                    background: "#ef4444", borderRadius: "50%",
                    display: "inline-block", flexShrink: 0,
                    boxShadow: "0 0 0 2px white",
                  }}
                />
              )}
              {active && (
                <div
                  style={{
                    position: "absolute", right: 0, top: "50%",
                    transform: "translateY(-50%)",
                    width: 3, height: 20, background: "#FF5C00",
                    borderRadius: "3px 0 0 3px",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#FFE4D6", color: "#FF5C00",
              fontWeight: 900, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#1f2937", margin: 0 }}>{adminName}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", background: "#fef2f2", color: "#ef4444",
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
}
