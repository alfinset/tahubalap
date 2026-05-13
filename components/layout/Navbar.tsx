"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useKeranjang } from "@/lib/store/keranjang";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Profile } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItem, hydrateFromStorage } = useKeranjang();
  const [user, setUser] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    hydrateFromStorage();
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(profile);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/produk", label: "Produk" },
    { href: "/resep", label: "Resep" },
  ];

  const cartCount = mounted ? totalItem() : 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-on-surface">
          <span className="text-2xl">🏎️</span>
          <span>Tahu <span className="text-primary-container">Balap</span></span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                pathname === link.href
                  ? "bg-primary-fixed text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart — sembunyikan untuk admin */}
          {(!user || user.role !== "admin") && (
            <Link
              href="/keranjang"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container hover:bg-primary-fixed transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 22 }}>
                shopping_cart
              </span>
              {/* Hanya render badge setelah mounted (client-side) */}
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-container text-white text-xs font-black rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User - hanya render setelah mounted */}
          {!mounted ? (
            // Placeholder saat SSR (sama ukurannya, tidak ada konten)
            <div className="w-20 h-9" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container hover:bg-primary-fixed transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-primary-container text-white text-xs font-black flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-semibold text-on-surface max-w-[100px] truncate">
                  {user.name}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                  expand_more
                </span>
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay untuk close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl border border-outline-variant shadow-xl z-50 overflow-hidden">
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
                      >
                        <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>dashboard</span>
                        Dashboard Admin
                      </Link>
                    )}
                    {/* Pesanan Saya — sembunyikan untuk admin */}
                    {user?.role !== "admin" && (
                      <Link
                        href="/pesanan"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>receipt_long</span>
                        Pesanan Saya
                      </Link>
                    )}
                    <hr className="border-outline-variant" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-bold text-primary-container hover:bg-primary-fixed rounded-xl transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-bold bg-primary-container text-white rounded-xl hover:bg-primary transition-all shadow-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
