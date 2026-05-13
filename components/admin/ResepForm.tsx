"use client";
import { createClient } from "@/lib/supabase/client";
import { simpanResep, hapusResep } from "@/app/admin/produk/actions";
import { getStorageUrl } from "@/lib/utils/format";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

interface Resep {
  id?: number; nama?: string; slug?: string; kategori?: string; badge?: string;
  badge_color?: string; emoji?: string; waktu?: string; level?: string;
  harga?: number; deskripsi?: string;
  bahan?: string[] | string;    // bisa string JSON dari DB
  langkah?: string[] | string;  // bisa string JSON dari DB
  tips?: string; gambar?: string; aktif?: boolean
}

// Parse nilai bahan/langkah dari DB (tersimpan sebagai JSON string)
function parseArrayField(val: string[] | string | undefined): string[] {
  if (!val) return [""];
  if (Array.isArray(val)) return val.length > 0 ? val : [""];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [""];
  } catch {
    return [""];
  }
}

export default function ResepForm({ resep }: { resep?: Resep }) {
  const router = useRouter();
  const supabase = createClient(); // hanya untuk upload storage
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nama: resep?.nama ?? "", slug: resep?.slug ?? "",
    kategori: resep?.kategori ?? "", badge: resep?.badge ?? "",
    badge_color: resep?.badge_color ?? "#FF5C00", emoji: resep?.emoji ?? "🧀",
    waktu: resep?.waktu ?? "", level: resep?.level ?? "Mudah",
    harga: resep?.harga ?? 0, deskripsi: resep?.deskripsi ?? "",
    tips: resep?.tips ?? "", aktif: resep?.aktif ?? true,
  });
  const [bahan, setBahan] = useState<string[]>(parseArrayField(resep?.bahan));
  const [langkah, setLangkah] = useState<string[]>(parseArrayField(resep?.langkah));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    let gambarPath = resep?.gambar ?? null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `resep/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
      if (upErr) { setError("Gagal upload gambar: " + upErr.message); setLoading(false); return; }
      gambarPath = `uploads/${path}`;
    }
    const payload = {
      ...form,
      bahan: JSON.stringify(bahan.filter(Boolean)),
      langkah: JSON.stringify(langkah.filter(Boolean)),
      gambar: gambarPath,
    };
    const result = await simpanResep(resep?.id, payload);
    if (!result.success) { setError("Gagal simpan: " + result.error); setLoading(false); return; }
    router.push("/admin/resep"); router.refresh();
  };

  const handleDelete = async () => {
    if (!resep?.id) return;
    if (!confirm(`Hapus resep "${resep.nama}"? Aksi ini tidak bisa dibatalkan.`)) return;
    setDeleting(true);
    const result = await hapusResep(resep.id);
    if (!result.success) { alert("Gagal hapus: " + result.error); setDeleting(false); return; }
    router.push("/admin/resep"); router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ marginBottom: 20, padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Info Dasar */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Info Resep</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><label style={labelStyle}>Nama *</label><input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value, slug: slugify(e.target.value) })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Slug *</label><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Emoji</label><input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>Waktu Masak</label><input value={form.waktu} onChange={(e) => setForm({ ...form, waktu: e.target.value })} style={inputStyle} placeholder="30 menit" /></div>
              <div><label style={labelStyle}>Level</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["Mudah", "Sedang", "Sulit"].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Harga (Rp)</label><input type="number" min={0} value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>Deskripsi</label><textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} /></div>
          </div>

          {/* Bahan */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: 0 }}>Bahan-bahan</h2>
              <button type="button" onClick={() => setBahan([...bahan, ""])} style={{ padding: "6px 14px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Tambah</button>
            </div>
            {bahan.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={b} onChange={(e) => { const n = [...bahan]; n[i] = e.target.value; setBahan(n); }} placeholder={`Bahan ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => setBahan(bahan.filter((_, j) => j !== i))} style={{ padding: "10px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>

          {/* Langkah */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: 0 }}>Cara Membuat</h2>
              <button type="button" onClick={() => setLangkah([...langkah, ""])} style={{ padding: "6px 14px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Tambah</button>
            </div>
            {langkah.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, background: "#FF5C00", color: "white", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0, marginTop: 11 }}>{i + 1}</div>
                <textarea rows={2} value={l} onChange={(e) => { const n = [...langkah]; n[i] = e.target.value; setLangkah(n); }} placeholder={`Langkah ${i + 1}`} style={{ ...inputStyle, flex: 1, resize: "vertical" }} />
                <button type="button" onClick={() => setLangkah(langkah.filter((_, j) => j !== i))} style={{ padding: "10px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, cursor: "pointer", alignSelf: "flex-start", marginTop: 8 }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Gambar</h2>
            <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed #e5e7eb", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: "#fafafa" }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: 160, margin: "0 auto", borderRadius: 8, display: "block" }} />
              ) : resep?.gambar ? (
                <img src={getStorageUrl(resep.gambar) ?? ""} alt="Gambar saat ini" style={{ maxHeight: 160, margin: "0 auto", borderRadius: 8, display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 40, color: "#d1d5db", display: "block", marginBottom: 8 }}>add_photo_alternate</span><p style={{ fontSize: 13, color: "#9ca3af" }}>Klik untuk upload</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
          </div>

          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 16px" }}>Badge & Setting</h2>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Badge Text</label><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} style={inputStyle} placeholder="Best Seller" /></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Badge Color</label><input type="color" value={form.badge_color} onChange={(e) => setForm({ ...form, badge_color: e.target.value })} style={{ ...inputStyle, height: 40, padding: 4 }} /></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Tips</label><textarea rows={3} value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Resep Aktif (tampil di publik)</span>
            </label>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "#FF5C00", color: "white", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: "pointer" }}>
            {loading ? "Menyimpan..." : resep?.id ? "Simpan Perubahan" : "Tambah Resep"}
          </button>

          {resep?.id && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              style={{ width: "100%", padding: "12px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {deleting ? "Menghapus..." : "🗑️ Hapus Resep Ini"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
