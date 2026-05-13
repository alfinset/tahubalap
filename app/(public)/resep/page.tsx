import { createClient } from "@/lib/supabase/server";
import { formatRupiah, getStorageUrl, truncate } from "@/lib/utils/format";
import Link from "next/link";
import type { Metadata } from "next";
import { Resep } from "@/types";

export const metadata: Metadata = { title: "Resep" };

export default async function ResepPage() {
  const supabase = await createClient();
  const { data: reseps } = await supabase.from("reseps").select("*").eq("aktif", true).order("id");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-headline-lg font-black text-on-surface mb-2">Resep Tahu</h1>
        <p className="text-on-surface-variant">Inspirasi masak dari dapur Tahu Balap</p>
      </div>

      {(reseps ?? []).length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="text-6xl block mb-4">📖</span>
          <p className="font-bold">Belum ada resep tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(reseps as Resep[]).map((resep) => (
            <Link key={resep.id} href={`/resep/${resep.slug}`} className="group bg-white rounded-3xl border border-outline-variant shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-primary-fixed flex items-center justify-center overflow-hidden">
                {resep.gambar ? (
                  <img src={getStorageUrl(resep.gambar) ?? ""} alt={resep.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-6xl">{resep.emoji ?? "🧀"}</span>
                )}
                {resep.badge && (
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white`} style={{ background: resep.badge_color ?? "#FF5C00" }}>
                    {resep.badge}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-on-surface mb-2 group-hover:text-primary-container transition-colors">{resep.nama}</h2>
                <p className="text-sm text-on-surface-variant mb-4 flex-1">{truncate(resep.deskripsi ?? "", 100)}</p>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  {resep.waktu && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">timer</span>{resep.waktu}</span>}
                  {resep.level && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">signal_cellular_alt</span>{resep.level}</span>}
                  {resep.harga && <span className="ml-auto font-bold text-primary-container">{formatRupiah(resep.harga)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
