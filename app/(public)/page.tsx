import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatRupiah, truncate, getStorageUrl } from "@/lib/utils/format";
import { Produk, Kategori } from "@/types";

export const metadata = { title: "Beranda" };

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: produks }, { data: kategoris }, { data: settings }] =
    await Promise.all([
      supabase.from("produks").select("*, kategori:kategoris(nama)").eq("aktif", true).order("id").limit(5),
      supabase.from("kategoris").select("*").order("id"),
      supabase.from("settings").select("key, value"),
    ]);

  const getSetting = (key: string, def = "") =>
    settings?.find((s) => s.key === key)?.value ?? def;

  const produkUnggulan = (produks ?? []) as Produk[];
  const featured = produkUnggulan[0];

  return (
    <>
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-secondary-container text-white font-bold text-xs uppercase tracking-wider">
              {getSetting("hero_badge", "Freshly Racing to Your Table 🏎️")}
            </span>
            <h1 className="text-display-lg font-black text-on-surface mb-6">
              {getSetting("hero_title", "Rasakan Tahu Balap yang Cepat & Lezat")}
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
              {getSetting("hero_subtitle", "Nikmati cita rasa street food otentik dengan standar kebersihan modern.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/produk"
                className="bg-primary-container text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-orange-200/40 hover:scale-105 active:scale-95 transition-all"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/produk"
                className="border-2 border-primary-container text-primary-container font-bold text-sm px-8 py-4 rounded-xl hover:bg-primary-fixed transition-all"
              >
                Lihat Menu
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full aspect-square max-w-md bg-primary-fixed rounded-[2rem] flex items-center justify-center text-8xl shadow-2xl rotate-3" style={{ overflow: "hidden" }}>
              {getSetting("hero_gambar") ? (
                <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${getSetting("hero_gambar")}`} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <span>🧀</span>
              )}
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="bg-secondary-container p-3 rounded-full">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">Pengiriman 15 Menit</p>
                <p className="text-xs text-on-surface-variant">Tercepat di kota</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <section className="bg-surface py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-headline-md font-bold mb-8 text-on-surface">Jelajahi Kategori</h2>
          <div className="flex gap-4 overflow-x-auto scroll-hide pb-4">
            <Link
              href="/produk"
              className="flex-none flex items-center gap-3 px-6 py-3 rounded-full bg-primary-container text-white font-bold text-sm transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              Semua
            </Link>
            {(kategoris ?? []).map((kat: Kategori) => (
              <Link
                key={kat.id}
                href={`/produk?kategori=${kat.slug}`}
                className="flex-none flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container hover:bg-primary-fixed-dim text-on-surface-variant font-bold text-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">restaurant</span>
                {kat.nama}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Produk Unggulan</h2>
            <p className="text-on-surface-variant text-body-md">Favorit pelanggan kami hari ini</p>
          </div>
          <Link href="/produk" className="text-primary-container font-bold text-sm flex items-center gap-2 group">
            Lihat semua
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>

        {produkUnggulan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Featured Large */}
            {featured && (
              <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-6 shadow-sm border border-outline-variant flex flex-col group hover:shadow-xl transition-all">
                <div className="relative overflow-hidden rounded-2xl mb-6 aspect-video bg-primary-fixed flex items-center justify-center">
                  {featured.gambar ? (
                    <img
                      src={getStorageUrl(featured.gambar) ?? ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={featured.nama}
                    />
                  ) : (
                    <span className="text-8xl">🧀</span>
                  )}
                  <span className="absolute top-4 right-4 bg-secondary-container text-white px-3 py-1 rounded-full text-xs font-bold">
                    MUST TRY
                  </span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-headline-md font-bold mb-1">{featured.nama}</h3>
                    <div className="flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-sm">4.9</span>
                      <span className="text-on-surface-variant text-sm ml-1">(120+ ulasan)</span>
                    </div>
                  </div>
                  <span className="text-primary-container font-bold text-headline-md">{formatRupiah(featured.harga)}</span>
                </div>
                <p className="text-on-surface-variant mb-6 flex-grow text-sm">
                  {truncate(featured.deskripsi ?? "", 100)}
                </p>
                <Link
                  href={`/produk/${featured.slug}`}
                  className="w-full bg-on-surface text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  Lihat Detail
                </Link>
              </div>
            )}

            {/* Small Cards */}
            {produkUnggulan.slice(1, 5).map((produk) => (
              <div key={produk.id} className="bg-white rounded-3xl p-4 shadow-sm border border-outline-variant group hover:shadow-lg transition-all">
                <div className="relative overflow-hidden rounded-xl mb-4 aspect-square bg-primary-fixed flex items-center justify-center">
                  {produk.gambar ? (
                    <img
                      src={getStorageUrl(produk.gambar) ?? ""}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      alt={produk.nama}
                    />
                  ) : (
                    <span className="text-5xl">🧀</span>
                  )}
                </div>
                <h4 className="font-bold text-sm mb-1">{produk.nama}</h4>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold">4.7</span>
                  </div>
                  <span className="font-bold text-primary-container text-sm">{formatRupiah(produk.harga)}</span>
                </div>
                <Link
                  href={`/produk/${produk.slug}`}
                  className="w-full bg-surface-container hover:bg-primary-fixed font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">add</span> Lihat
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="text-6xl block mb-4">🧀</span>
            <p className="font-bold">Belum ada produk tersedia</p>
          </div>
        )}
      </section>

      {/* Why TahuBalap */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-headline-lg font-bold text-on-surface mb-3">Kenapa Pilih Tahu Balap?</h2>
            <p className="text-on-surface-variant text-body-md max-w-xl mx-auto">
              Kami berkomitmen menghadirkan tahu terbaik dengan pengalaman belanja yang menyenangkan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "bolt", color: "bg-primary-fixed", iconColor: "text-primary-container", title: "Super Cepat", desc: "Pengiriman dalam 15 menit ke lokasi Anda. Tahu masih panas sampai di tangan!" },
              { icon: "verified", color: "bg-green-50", iconColor: "text-green-600", title: "Kualitas Terjamin", desc: "Bahan baku segar setiap hari dari pengrajin tahu terpercaya lokal." },
              { icon: "payments", color: "bg-yellow-50", iconColor: "text-yellow-600", title: "Harga Terjangkau", desc: "Harga street food yang bersahabat dengan kualitas yang tidak murahan." },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-outline-variant text-center">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={`material-symbols-outlined ${item.iconColor} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <h3 className="font-bold text-body-lg mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
