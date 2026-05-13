"use client";
import { hapusResep } from "@/app/admin/produk/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteResepButton({ id, nama }: { id: number; nama: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Hapus resep "${nama}"? Aksi ini tidak bisa dibatalkan.`)) return;
    setLoading(true);
    const result = await hapusResep(id);
    if (!result.success) { alert("Gagal hapus: " + result.error); }
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading}
      style={{ padding: "7px 10px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
      {loading ? "..." : "🗑️"}
    </button>
  );
}
