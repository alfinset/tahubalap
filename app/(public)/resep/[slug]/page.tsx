import { createClient } from "@/lib/supabase/server";
import { formatRupiah, getStorageUrl } from "@/lib/utils/format";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("reseps").select("nama").eq("slug", slug).single();
  return { title: data?.nama ?? "Resep" };
}

export default async function ResepDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: resep } = await supabase.from("reseps").select("*").eq("slug", slug).eq("aktif", true).single();
  if (!resep) notFound();

  // bahan & langkah tersimpan sebagai JSON string di DB, perlu di-parse
  function parseArr(val: unknown): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  }
  const bahan: string[] = parseArr(resep.bahan);
  const langkah: string[] = parseArr(resep.langkah);


  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        {resep.badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4" style={{ background: resep.badge_color ?? "#FF5C00" }}>
            {resep.badge}
          </span>
        )}
        <h1 className="text-headline-lg font-black text-on-surface mb-4">{resep.nama}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
          {resep.waktu && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">timer</span>{resep.waktu}</span>}
          {resep.level && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">signal_cellular_alt</span>{resep.level}</span>}
          {resep.harga && <span className="flex items-center gap-1 text-primary-container font-bold"><span className="material-symbols-outlined text-base">payments</span>{formatRupiah(resep.harga)}</span>}
        </div>
      </div>

      {/* Gambar */}
      {resep.gambar && (
        <div className="rounded-3xl overflow-hidden aspect-video mb-10 shadow-lg">
          <img src={getStorageUrl(resep.gambar) ?? ""} alt={resep.nama} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-on-surface-variant leading-relaxed mb-10">{resep.deskripsi}</p>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Bahan */}
        <div className="bg-surface-container-low rounded-2xl p-6">
          <h2 className="font-black text-on-surface text-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">grocery</span>Bahan-bahan
          </h2>
          <ul className="space-y-2">
            {bahan.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                <span className="w-5 h-5 bg-primary-container text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        {resep.tips && (
          <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
            <h2 className="font-black text-yellow-800 text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-600">lightbulb</span>Tips
            </h2>
            <p className="text-sm text-yellow-700 leading-relaxed">{resep.tips}</p>
          </div>
        )}
      </div>

      {/* Langkah */}
      <div>
        <h2 className="font-black text-on-surface text-xl mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">format_list_numbered</span>Cara Membuat
        </h2>
        <div className="space-y-4">
          {langkah.map((l, i) => (
            <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl border border-outline-variant">
              <span className="w-8 h-8 bg-primary-container text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</span>
              <p className="text-sm text-on-surface-variant leading-relaxed pt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
