"use client";

import { useKeranjang } from "@/lib/store/keranjang";
import { formatRupiah, getStorageUrl } from "@/lib/utils/format";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function KeranjangPage() {
  const { items, update, hapus, total, hydrateFromStorage } = useKeranjang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-headline-md font-black text-on-surface mb-8">Keranjang Belanja</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-container rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-headline-md font-black text-on-surface mb-2">Keranjang Kosong</h1>
        <p className="text-on-surface-variant mb-6">Belum ada produk yang ditambahkan</p>
        <Link href="/produk" className="inline-flex items-center gap-2 bg-primary-container text-white font-bold px-6 py-3 rounded-xl hover:bg-primary transition-all">
          <span className="material-symbols-outlined text-sm">shopping_bag</span>
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Tombol Kembali */}
      <div className="mb-4">
        <Link href="/produk" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-bold text-sm transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali Belanja
        </Link>
      </div>
      <h1 className="text-headline-md font-black text-on-surface mb-8">Keranjang Belanja</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-outline-variant p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary-fixed flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.gambar ? (
                  <img src={getStorageUrl(item.gambar) ?? ""} alt={item.nama} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🧀</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-on-surface truncate">{item.nama}</p>
                <p className="text-xs text-on-surface-variant">{formatRupiah(item.harga)} / {item.satuan}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => update(item.id, item.jumlah - 1)} className="w-8 h-8 rounded-lg bg-surface-container font-bold hover:bg-primary-fixed transition-all">-</button>
                <span className="font-black w-6 text-center text-sm">{item.jumlah}</span>
                <button onClick={() => update(item.id, item.jumlah + 1)} className="w-8 h-8 rounded-lg bg-surface-container font-bold hover:bg-primary-fixed transition-all">+</button>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-sm text-on-surface">{formatRupiah(item.harga * item.jumlah)}</p>
                <button onClick={() => hapus(item.id)} className="text-xs text-red-400 hover:text-red-600 font-medium mt-1">Hapus</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6 h-fit sticky top-20">
          <h2 className="font-black text-on-surface mb-4">Ringkasan</h2>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal ({items.reduce((s, i) => s + i.jumlah, 0)} item)</span>
              <span className="font-bold text-on-surface">{formatRupiah(total())}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Ongkos Kirim</span>
              <span className="font-bold text-on-surface">{formatRupiah(5000)}</span>
            </div>
            <div className="border-t border-outline-variant pt-3 flex justify-between font-black text-base">
              <span>Total</span>
              <span className="text-primary-container">{formatRupiah(total() + 5000)}</span>
            </div>
          </div>
          <Link href="/checkout" className="block w-full text-center bg-primary-container text-white font-black py-3 rounded-xl hover:bg-primary transition-all">
            Lanjut Checkout →
          </Link>
          <Link href="/produk" className="block w-full text-center text-primary-container font-bold py-3 text-sm hover:underline mt-2">
            + Tambah Produk Lagi
          </Link>
        </div>
      </div>
    </div>
  );
}
