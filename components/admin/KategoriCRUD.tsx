"use client";
import { simpanKategori, hapusKategori } from "@/app/admin/produk/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Kategori } from "@/types";

export default function KategoriCRUD({ kategoris, searchQuery = "" }: { kategoris: Kategori[]; searchQuery?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", slug: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await simpanKategori(editId, form);
    if (!result.success) { setError("Gagal: " + result.error); setLoading(false); return; }
    setEditId(null);
    setForm({ nama: "", slug: "", deskripsi: "" });
    setLoading(false);
    router.refresh();
  };

  const handleEdit = (k: Kategori) => {
    setEditId(k.id);
    setForm({ nama: k.nama, slug: k.slug, deskripsi: k.deskripsi ?? "" });
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus kategori "${nama}"?`)) return;
    const result = await hapusKategori(id);
    if (!result.success) { alert("Gagal hapus: " + result.error); return; }
    router.refresh();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" as const };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 24 }}>
      {/* Form */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>{editId ? "Edit Kategori" : "Tambah Kategori"}</h2>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Nama *</label>
            <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value, slug: slugify(e.target.value) })} style={inputStyle} placeholder="Tahu Mentah" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Slug *</label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Deskripsi</label>
            <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", background: "#FF5C00", color: "white", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              {loading ? "Menyimpan..." : editId ? "Simpan" : "Tambah"}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nama: "", slug: "", deskripsi: "" }); }} style={{ padding: "10px 16px", background: "#f3f4f6", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Batal</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nama", "Slug", "Deskripsi", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kategoris.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
                <p style={{ fontWeight: 700 }}>{searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada kategori"}</p>
              </td></tr>
            ) : kategoris.map((k) => (
              <tr key={k.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: 14 }}>{k.nama}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>{k.slug}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#6b7280" }}>{k.deskripsi ?? "-"}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleEdit(k)} style={{ padding: "6px 14px", background: "#eff6ff", color: "#3b82f6", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => handleDelete(k.id, k.nama)} style={{ padding: "6px 14px", background: "#fef2f2", color: "#ef4444", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
