"use client";

import { Produk } from "@/types";
import { formatRupiah, getStorageUrl } from "@/lib/utils/format";
import { useKeranjang } from "@/lib/store/keranjang";
import Link from "next/link";
import { useState } from "react";

export default function ProdukGrid({ produks }: { produks: Produk[] }) {
  const tambah = useKeranjang((s) => s.tambah);
  const [added, setAdded] = useState<number | null>(null);

  const handleTambah = (produk: Produk) => {
    tambah({ id: produk.id, nama: produk.nama, harga: produk.harga, jumlah: 1, gambar: produk.gambar, satuan: produk.satuan });
    setAdded(produk.id);
    setTimeout(() => setAdded(null), 1500);
  };

  if (produks.length === 0) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        <span className="text-6xl block mb-4">🧀</span>
        <p className="font-bold text-lg">Produk tidak ditemukan</p>
        <p className="text-sm mt-2">Coba kategori atau pencarian lain</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {produks.map((produk) => (
        <div key={produk.id} className="bg-white rounded-3xl border border-outline-variant shadow-sm hover:shadow-lg transition-all group flex flex-col">
          <Link href={`/produk/${produk.slug}`} className="block">
            <div className="relative overflow-hidden rounded-t-3xl aspect-square bg-primary-fixed flex items-center justify-center">
              {produk.gambar ? (
                <img
                  src={getStorageUrl(produk.gambar) ?? ""}
                  alt={produk.nama}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <span className="text-6xl">🧀</span>
              )}
              {produk.stok <= 5 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Stok terbatas
                </span>
              )}
            </div>
          </Link>

          <div className="p-4 flex flex-col flex-1">
            <Link href={`/produk/${produk.slug}`}>
              <h3 className="font-bold text-sm text-on-surface mb-1 hover:text-primary-container transition-colors line-clamp-2">{produk.nama}</h3>
            </Link>
            <p className="text-xs text-on-surface-variant mb-3">/{produk.satuan}</p>

            <div className="flex items-center justify-between mt-auto">
              <span className="font-black text-primary-container">{formatRupiah(produk.harga)}</span>
            </div>

            <button
              onClick={() => handleTambah(produk)}
              disabled={produk.stok === 0}
              className={`mt-3 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                added === produk.id
                  ? "bg-green-500 text-white"
                  : produk.stok === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-surface-container hover:bg-primary-container hover:text-white text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {added === produk.id ? "check" : produk.stok === 0 ? "remove_shopping_cart" : "add_shopping_cart"}
              </span>
              {added === produk.id ? "Ditambahkan!" : produk.stok === 0 ? "Stok Habis" : "Tambah"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
