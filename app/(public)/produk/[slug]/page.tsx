import { createClient } from "@/lib/supabase/server";
import { formatRupiah, getStorageUrl } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/produk/AddToCartButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("produks").select("nama, deskripsi").eq("slug", slug).single();
  return { title: data?.nama ?? "Produk", description: data?.deskripsi ?? "" };
}

export default async function ProdukDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: produk } = await supabase
    .from("produks")
    .select("*, kategori:kategoris(nama, slug)")
    .eq("slug", slug)
    .eq("aktif", true)
    .single();

  if (!produk) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Gambar */}
        <div className="rounded-3xl overflow-hidden aspect-square bg-primary-fixed flex items-center justify-center shadow-lg">
          {produk.gambar ? (
            <img src={getStorageUrl(produk.gambar) ?? ""} alt={produk.nama} className="w-full h-full object-cover" />
          ) : (
            <span className="text-9xl">🧀</span>
          )}
        </div>

        {/* Info */}
        <div>
          {produk.kategori && (
            <span className="inline-block px-3 py-1 bg-primary-fixed text-primary-container text-xs font-bold rounded-full mb-4">
              {produk.kategori.nama}
            </span>
          )}
          <h1 className="text-headline-lg font-black text-on-surface mb-3">{produk.nama}</h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <span className="text-sm text-on-surface-variant font-medium">(120+ ulasan)</span>
          </div>

          <div className="text-3xl font-black text-primary-container mb-2">
            {formatRupiah(produk.harga)}
            <span className="text-sm font-normal text-on-surface-variant ml-2">/ {produk.satuan}</span>
          </div>

          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{produk.deskripsi}</p>

          {/* Stok */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-surface-container rounded-2xl">
            <span className="material-symbols-outlined text-primary-container">inventory_2</span>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Stok tersedia</p>
              <p className={`font-black text-sm ${produk.stok <= 5 ? "text-red-500" : "text-on-surface"}`}>
                {produk.stok} {produk.satuan}
                {produk.stok <= 5 && produk.stok > 0 && " (hampir habis!)"}
                {produk.stok === 0 && " (habis)"}
              </p>
            </div>
          </div>

          <AddToCartButton produk={produk} />
        </div>
      </div>
    </div>
  );
}
