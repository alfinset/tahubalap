import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal, getStatusStyle } from "@/lib/utils/format";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pesanan Saya" };

export default async function PesananPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pesanans } = await supabase
    .from("pesanans").select("*, pembayaran:pembayarans(*)")
    .eq("user_id", user!.id).order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-headline-md font-black text-on-surface mb-8">Pesanan Saya</h1>
      {(!pesanans || pesanans.length === 0) ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">📭</span>
          <p className="font-bold text-on-surface mb-2">Belum ada pesanan</p>
          <Link href="/produk" className="text-primary-container font-bold hover:underline">Mulai belanja</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pesanans.map((p: any) => {
            const s = getStatusStyle(p.status);
            return (
              <Link key={p.id} href={`/pesanan/${p.kode_pesanan}`}
                className="block bg-white rounded-2xl border border-outline-variant p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-on-surface text-sm">#{p.kode_pesanan}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <span>{formatTanggal(p.created_at)}</span>
                  <span className="font-black text-on-surface">{formatRupiah(p.total_harga)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
