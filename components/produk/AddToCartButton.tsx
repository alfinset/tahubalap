"use client";

import { useKeranjang } from "@/lib/store/keranjang";
import { Produk } from "@/types";
import { useEffect, useState } from "react";

export default function AddToCartButton({ produk }: { produk: Produk }) {
  const { tambah, hydrateFromStorage } = useKeranjang();
  const [jumlah, setJumlah] = useState(1);
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    setMounted(true);
  }, []);

  const handleTambah = () => {
    tambah({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      jumlah,
      gambar: produk.gambar,
      satuan: produk.satuan,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-14 bg-surface-container rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-on-surface-variant">Jumlah:</span>
        <div className="flex items-center gap-3 bg-surface-container rounded-xl px-2">
          <button
            onClick={() => setJumlah(Math.max(1, jumlah - 1))}
            className="w-8 h-8 flex items-center justify-center font-bold hover:text-primary-container transition-colors"
          >
            -
          </button>
          <span className="font-black text-on-surface w-6 text-center">{jumlah}</span>
          <button
            onClick={() => setJumlah(Math.min(produk.stok, jumlah + 1))}
            className="w-8 h-8 flex items-center justify-center font-bold hover:text-primary-container transition-colors"
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={handleTambah}
        disabled={produk.stok === 0}
        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
          added
            ? "bg-green-500 text-white"
            : produk.stok === 0
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary-container text-white hover:bg-primary shadow-lg shadow-orange-200/40"
        }`}
      >
        <span className="material-symbols-outlined">
          {added ? "check_circle" : "add_shopping_cart"}
        </span>
        {added
          ? "Berhasil ditambahkan!"
          : produk.stok === 0
          ? "Stok Habis"
          : "Tambah ke Keranjang"}
      </button>
    </div>
  );
}
