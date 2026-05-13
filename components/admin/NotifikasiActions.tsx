"use client";
import { tandaiBacaSemuaNotifikasi, hapusSemuaNotifikasi } from "@/app/admin/produk/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotifikasiActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const tandaiBacaSemua = async () => {
    setLoading(true);
    await tandaiBacaSemuaNotifikasi(userId);
    router.refresh();
    setLoading(false);
  };

  const hapusSemua = async () => {
    if (!confirm("Hapus semua notifikasi?")) return;
    setLoading(true);
    await hapusSemuaNotifikasi(userId);
    router.refresh();
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={tandaiBacaSemua} disabled={loading}
        style={{ padding: "9px 18px", border: "2px solid #FF5C00", color: "#FF5C00", background: "white", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        Tandai Semua Dibaca
      </button>
      <button onClick={hapusSemua} disabled={loading}
        style={{ padding: "9px 18px", border: "none", background: "#fef2f2", color: "#ef4444", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        Hapus Semua
      </button>
    </div>
  );
}
