import { createDirectAdminClient } from "@/lib/supabase/server";
import { formatRupiah, getStatusStyle, formatTanggalSingkat } from "@/lib/utils/format";
import Link from "next/link";
import PeriodeFilter from "@/components/admin/PeriodeFilter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

interface Props { searchParams: Promise<{ periode?: string; search?: string; filter_date?: string }> }

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const periode = params.periode === "30" ? 30 : 7;
  const supabase = createDirectAdminClient();

  // Stats
  const [
    { count: totalPesanan },
    { count: pesananHariIni },
    { count: totalProduk },
    { count: stokMenipis },
    { count: totalCustomer },
    { data: pendapatanData },
  ] = await Promise.all([
    supabase.from("pesanans").select("*", { count: "exact", head: true }),
    supabase.from("pesanans").select("*", { count: "exact", head: true }).gte("created_at", new Date().toISOString().split("T")[0]),
    supabase.from("produks").select("*", { count: "exact", head: true }),
    supabase.from("produks").select("*", { count: "exact", head: true }).lte("stok", 10).eq("aktif", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("pesanans").select("total_harga").eq("status", "selesai")
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const pendapatanBulan = (pendapatanData ?? []).reduce((s: number, p: any) => s + p.total_harga, 0);


  // Data pendapatan REAL per hari/minggu untuk grafik
  const now = new Date();
  let revenueByDate: Record<string, number> = {};

  if (periode === 7) {
    // Query pendapatan 7 hari terakhir (status selesai)
    const start7d = new Date(now);
    start7d.setDate(start7d.getDate() - 6);
    start7d.setHours(0, 0, 0, 0);
    const { data: rev7d } = await supabase
      .from("pesanans").select("created_at, total_harga")
      .eq("status", "selesai")
      .gte("created_at", start7d.toISOString());
    // Agregasi per hari
    (rev7d ?? []).forEach((p: any) => {
      const day = new Date(p.created_at).toISOString().split("T")[0];
      revenueByDate[day] = (revenueByDate[day] ?? 0) + p.total_harga;
    });
  } else {
    // Query pendapatan 4 minggu terakhir
    const start4w = new Date(now);
    start4w.setDate(start4w.getDate() - 27);
    start4w.setHours(0, 0, 0, 0);
    const { data: rev4w } = await supabase
      .from("pesanans").select("created_at, total_harga")
      .eq("status", "selesai")
      .gte("created_at", start4w.toISOString());
    (rev4w ?? []).forEach((p: any) => {
      const day = new Date(p.created_at).toISOString().split("T")[0];
      revenueByDate[day] = (revenueByDate[day] ?? 0) + p.total_harga;
    });
  }

  // Pesanan terbaru
  let query = supabase.from("pesanans").select("*, user:profiles(name, email)").order("created_at", { ascending: false }).limit(5);
  if (params.search) query = query.or(`kode_pesanan.ilike.%${params.search}%`);
  if (params.filter_date) query = query.gte("created_at", params.filter_date).lt("created_at", params.filter_date + "T23:59:59");
  const { data: pesananTerbaru } = await query;

  // Stok menipis
  const { data: produkStokSedikit } = await supabase.from("produks").select("*").lte("stok", 10).eq("aktif", true);

  // Best seller sepanjang waktu (agregasi dari detail_pesanans)
  const { data: detailPesananData } = await supabase
    .from("detail_pesanans")
    .select("produk_id, jumlah, produk:produks(id, nama, gambar)");

  // Agregasi di JS: group by produk_id, sum jumlah
  const produkMap = new Map<number, { id: number; nama: string; gambar: string | null; totalTerjual: number }>();
  (detailPesananData ?? []).forEach((d: any) => {
    const pid = d.produk_id;
    if (!produkMap.has(pid)) {
      produkMap.set(pid, { id: pid, nama: d.produk?.nama ?? "", gambar: d.produk?.gambar ?? null, totalTerjual: 0 });
    }
    produkMap.get(pid)!.totalTerjual += (d.jumlah ?? 0);
  });
  const bestSeller = Array.from(produkMap.values()).sort((a, b) => b.totalTerjual - a.totalTerjual)[0] ?? null;

  const stats = [
    { label: "Total Pendapatan", value: formatRupiah(pendapatanBulan), icon: "payments", color: "#fff7ed", iconColor: "#FF5C00" },
    { label: "Total Pesanan Masuk", value: String(totalPesanan ?? 0), icon: "shopping_basket", color: "#fffbeb", iconColor: "#f59e0b" },
    { label: "Total Produk", value: String(totalProduk ?? 0), icon: "inventory_2", color: "#f0fdf4", iconColor: "#16a34a", badge: stokMenipis ? `${stokMenipis} Menipis!` : null },
  ];

  // Build tren dengan pendapatan REAL
  const tren = Array.from({ length: periode === 7 ? 7 : 4 }, (_, i) => {
    if (periode === 7) {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateKey = d.toISOString().split("T")[0];
      const revenue = revenueByDate[dateKey] ?? 0;
      return {
        label: d.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase(),
        tanggal: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        is_today: i === 6,
        revenue,
        _date: dateKey,
      };
    } else {
      const end = new Date(now); end.setDate(end.getDate() - i * 7);
      const start = new Date(end); start.setDate(start.getDate() - 6);
      // Sum revenue in this week range
      let weekRevenue = 0;
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      Object.entries(revenueByDate).forEach(([day, rev]) => {
        if (day >= startStr && day <= endStr) weekRevenue += rev;
      });
      return {
        label: `MG ${4 - i}`,
        tanggal: `${start.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`,
        is_today: false,
        revenue: weekRevenue,
        _date: null,
      };
    }
  });

  const maxRevenue = Math.max(...tren.map((d) => d.revenue), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", margin: 0 }}>Dashboard Admin</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0", fontWeight: 600 }}>Selamat datang kembali, Admin!</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin/produk" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", border: "2px solid #FF5C00", color: "#FF5C00", fontWeight: 800, fontSize: 13, borderRadius: 12, textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restaurant_menu</span> Kelola Produk
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, background: s.color, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: s.iconColor, fontSize: 22 }}>{s.icon}</span>
              </div>
              {s.badge && <span style={{ background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>{s.badge}</span>}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: "#1f2937", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Spotlight */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 24 }}>
        {/* Chart */}
        <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: 0 }}>Grafik Pendapatan</h2>
            <PeriodeFilter currentPeriode={periode} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, paddingBottom: 8 }}>
            {tren.map((d, i) => {
              const heightPct = maxRevenue > 0 ? Math.max(4, (d.revenue / maxRevenue) * 100) : 4;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%" }}>
                    <div
                      title={`${d.tanggal}: Rp${d.revenue.toLocaleString("id-ID")}`}
                      style={{ width: "100%", height: `${heightPct}%`, background: d.is_today ? "#FF5C00" : (d.revenue > 0 ? "#FFB38A" : "#FFE4D6"), borderRadius: "8px 8px 0 0", transition: "all 0.3s", cursor: "help" }}
                    />
                  </div>
                  <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: d.is_today ? "#FF5C00" : "#9ca3af", textTransform: "uppercase" }}>{d.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 20, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#FF5C00", display: "inline-block" }} /> Hari ini</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#FFB38A", display: "inline-block" }} /> Ada pendapatan</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#FFE4D6", display: "inline-block" }} /> Tidak ada</span>
          </div>
        </div>

        {/* Best Seller Spotlight */}
        <div style={{ background: "linear-gradient(135deg, #FF5C00, #a73a00)", borderRadius: 16, padding: 28, color: "white", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 160 }}>local_fire_department</span>
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>Menu Unggulan🔥</h2>
            <p style={{ fontSize: 13, opacity: 0.85, margin: "0 0 20px", lineHeight: 1.5 }}>Produk terlaris sepanjang waktu.</p>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                {bestSeller?.gambar ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bestSeller.gambar}`}
                    alt={bestSeller.nama}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : <span>🧀</span>}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 2px" }}>{bestSeller?.nama ?? "Belum ada data"}</p>
                <p style={{ fontSize: 11, opacity: 0.75, margin: 0 }}>Best Seller Sepanjang Waktu</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.8 }}>
              <span>Total Terjual</span>
              <strong>{bestSeller ? `${bestSeller.totalTerjual} pcs` : "0 pcs"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", margin: 0 }}>Pesanan Terbaru</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Order ID", "Customer", "Date", "Amount", "Status", "Action"].map((h) => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(pesananTerbaru ?? []).length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div><p style={{ fontWeight: 700 }}>Belum ada pesanan</p>
              </td></tr>
            ) : (pesananTerbaru ?? []).map((p: any) => {
              const st = getStatusStyle(p.status);
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 800, fontSize: 13, color: "#1f2937" }}>#{p.kode_pesanan}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFE4D6", color: "#FF5C00", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {(p.user?.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{p.user?.name ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#6b7280" }}>{formatTanggalSingkat(p.created_at)}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, fontWeight: 800, color: "#1f2937" }}>{formatRupiah(p.total_harga)}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 20 }} className={`${st.bg} ${st.text}`}>{st.label}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Link href={`/admin/pesanan/${p.id}`} style={{ color: "#FF5C00", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Details</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
          <Link href="/admin/pesanan" style={{ color: "#FF5C00", fontWeight: 800, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Lihat Semua Pesanan <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Stok Menipis */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Peringatan Stok</h3>
          </div>
          {(produkStokSedikit ?? []).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>✅ Semua stok aman!</div>
          ) : (produkStokSedikit ?? []).map((p: any) => (
            <div key={p.id} style={{ padding: "12px 24px", borderBottom: "1px solid #f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#1f2937", fontWeight: 600 }}>{p.nama}</span>
              <span style={{ background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>{p.stok} {p.satuan}</span>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 20px" }}>Statistik Cepat</h3>
          {[
            { label: "Total Customer", value: totalCustomer ?? 0, color: "#1f2937" },
            { label: "Pesanan Hari Ini", value: pesananHariIni ?? 0, color: "#FF5C00" },
            { label: "Produk", value: totalProduk ?? 0, color: "#1f2937" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid #f3f4f6", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 20px" }}>Aksi Cepat</h3>
          {[
            { href: "/admin/produk/create", icon: "add_box", label: "Tambah Produk Baru" },
            { href: "/admin/pesanan?status=menunggu", icon: "pending_actions", label: "Pesanan Menunggu" },
            { href: "/admin/pesanan?status=diproses", icon: "payments", label: "Konfirmasi Bayar" },
          ].map((a, i) => (
            <Link key={i} href={a.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f9fafb", borderRadius: 12, textDecoration: "none", fontSize: 13, fontWeight: 700, color: "#1f2937", marginBottom: 8, transition: "all 0.15s" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#FF5C00" }}>{a.icon}</span>{a.label}
            </Link>
          ))}

        </div>
      </div>
    </div>
  );
}

