import { createClient } from "@/lib/supabase/server";
import ProdukGrid from "@/components/produk/ProdukGrid";
import { Kategori } from "@/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produk" };

interface Props {
  searchParams: Promise<{ kategori?: string; q?: string }>;
}

export default async function ProdukPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("produks")
    .select("*, kategori:kategoris(nama, slug)")
    .eq("aktif", true)
    .order("id");

  if (params.kategori) {
    const { data: kat } = await supabase
      .from("kategoris")
      .select("id")
      .eq("slug", params.kategori)
      .single();
    if (kat) query = query.eq("kategori_id", kat.id);
  }

  if (params.q) {
    query = query.ilike("nama", `%${params.q}%`);
  }

  const [{ data: produks }, { data: kategoris }] = await Promise.all([
    query,
    supabase.from("kategoris").select("*").order("id"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-headline-lg font-black text-on-surface mb-2">Semua Produk</h1>
        <p className="text-on-surface-variant">Pilih tahu favorit Anda dari koleksi kami</p>
      </div>

      {/* Filter Kategori */}
      <div className="flex gap-3 overflow-x-auto scroll-hide pb-4 mb-8">
        <Link
          href="/produk"
          className={`flex-none px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            !params.kategori ? "bg-primary-container text-white" : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed"
          }`}
        >
          Semua
        </Link>
        {(kategoris ?? []).map((kat: Kategori) => (
          <Link
            key={kat.id}
            href={`/produk?kategori=${kat.slug}`}
            className={`flex-none px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              params.kategori === kat.slug
                ? "bg-primary-container text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-primary-fixed"
            }`}
          >
            {kat.nama}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-8">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 20 }}>search</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Cari produk..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary-container text-sm font-medium"
          />
        </div>
      </form>

      <ProdukGrid produks={produks ?? []} />
    </div>
  );
}
