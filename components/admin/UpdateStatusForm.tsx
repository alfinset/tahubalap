"use client";
import { updateStatusPesanan, konfirmasiPembayaran } from "@/app/admin/produk/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  pesananId: number;
  type: "status" | "bayar";
  currentStatus?: string;
}

export default function UpdateStatusForm({ pesananId, type, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus ?? "menunggu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusOptions = ["menunggu", "diproses", "dikirim", "selesai", "dibatalkan"];

  const handleUpdate = async () => {
    setLoading(true); setError("");
    let result;
    if (type === "status") {
      result = await updateStatusPesanan(pesananId, status);
    } else {
      result = await konfirmasiPembayaran(pesananId);
    }
    if (!result.success) { setError("Gagal: " + result.error); }
    router.refresh();
    setLoading(false);
  };

  if (type === "bayar") {
    return (
      <div>
        {error && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{error}</p>}
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{ marginTop: 12, width: "100%", padding: "10px", background: "#16a34a", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          {loading ? "Mengkonfirmasi..." : "✅ Konfirmasi Pembayaran"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {error && <p style={{ color: "#ef4444", fontSize: 12, width: "100%" }}>{error}</p>}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#1f2937", background: "white", cursor: "pointer" }}
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{ padding: "10px 24px", background: "#FF5C00", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer" }}
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
