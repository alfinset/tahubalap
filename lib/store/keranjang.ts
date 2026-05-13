import { create } from "zustand";
import { KeranjangItem } from "@/types";

interface KeranjangStore {
  items: KeranjangItem[];
  _hydrated: boolean;
  tambah: (item: KeranjangItem) => void;
  update: (id: number, jumlah: number) => void;
  hapus: (id: number) => void;
  kosongkan: () => void;
  total: () => number;
  totalItem: () => number;
  hydrateFromStorage: () => void;
}

const STORAGE_KEY = "toko-tahu-keranjang";

export const useKeranjang = create<KeranjangStore>((set, get) => ({
  items: [],
  _hydrated: false,

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { items } = JSON.parse(stored);
        set({ items: items ?? [], _hydrated: true });
      } else {
        set({ _hydrated: true });
      }
    } catch {
      set({ _hydrated: true });
    }
  },

  tambah: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.id === item.id);
    let newItems: KeranjangItem[];
    if (existing) {
      newItems = items.map((i) =>
        i.id === item.id ? { ...i, jumlah: i.jumlah + item.jumlah } : i
      );
    } else {
      newItems = [...items, item];
    }
    set({ items: newItems });
    saveToStorage(newItems);
  },

  update: (id, jumlah) => {
    if (jumlah <= 0) {
      get().hapus(id);
      return;
    }
    const newItems = get().items.map((i) =>
      i.id === id ? { ...i, jumlah } : i
    );
    set({ items: newItems });
    saveToStorage(newItems);
  },

  hapus: (id) => {
    const newItems = get().items.filter((i) => i.id !== id);
    set({ items: newItems });
    saveToStorage(newItems);
  },

  kosongkan: () => {
    set({ items: [] });
    saveToStorage([]);
  },

  total: () =>
    get().items.reduce((sum, i) => sum + i.harga * i.jumlah, 0),

  totalItem: () =>
    get().items.reduce((sum, i) => sum + i.jumlah, 0),
}));

function saveToStorage(items: KeranjangItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    // ignore
  }
}
