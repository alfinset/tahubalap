"use client";
import { createClient } from "@/lib/supabase/client";
import { simpanProduk } from "@/app/admin/produk/actions";
import { getStorageUrl } from "@/lib/utils/format";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";


interface Kategori { id: number; nama: string }
interface Produk { id?: number; nama?: string; slug?: string; deskripsi?: string; harga?: number; stok?: number; gambar?: string; satuan?: string; aktif?: boolean; kategori_id?: number }

export default function ProdukForm({ kategoris, produk }: { kategoris: Kategori[]; produk?: Produk }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nama: produk?.nama ?? "", slug: produk?.slug ?? "", deskripsi: produk?.deskripsi ?? "",
    harga: produk?.harga ?? 0, stok: produk?.stok ?? 0, satuan: produk?.satuan ?? "pcs",
    aktif: produk?.aktif ?? true, kategori_id: produk?.kategori_id ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    let gambarPath = produk?.gambar ?? null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `produk/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
      if (upErr) { setError("Gagal upload gambar: " + upErr.message); setLoading(false); return; }
      gambarPath = `uploads/${path}`;
      // DEBUG: log the stored path
      console.log('Uploaded image stored at:', gambarPath);

    }

    const payload = { ...form, gambar: gambarPath, kategori_id: form.kategori_id || null };
    console.log('Payload to be saved:', payload);

    // Gunakan Server Action agar bypass RLS (pakai Service Role Key)
    const result = await simpanProduk(produk?.id, payload);
    if (!result.success) {
      setError('Gagal menyimpan: ' + result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/produk");
    router.refresh();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ marginBottom: 20, padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Info Produk</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nama Produk *</label>
              <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value, slug: slugify(e.target.value) })} style={inputStyle} placeholder="Tahu Putih Segar" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Slug (URL) *</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Deskripsi</label>
              <textarea rows={4} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Deskripsi produk..." />
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Harga & Stok</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Harga (Rp) *</label>
                <input required type="number" min={0} value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stok *</label>
                <input required type="number" min={0} value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Satuan *</label>
                <input required value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} style={inputStyle} placeholder="pcs, kg, bungkus" />
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Gambar Produk</h2>
            <div onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #e5e7eb", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: "#fafafa" }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: 160, margin: "0 auto", borderRadius: 8, display: "block" }} />
              ) : produk?.gambar ? (
                <img
                  src={getStorageUrl(produk.gambar) ?? ""}
                  alt="Gambar saat ini"
                  style={{ maxHeight: 160, margin: "0 auto", borderRadius: 8, display: "block" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#d1d5db", display: "block", marginBottom: 8 }}>add_photo_alternate</span>
                  <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Klik untuk upload gambar</p>
                </div>
              )}
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                {preview ? "Klik untuk ganti gambar" : produk?.gambar ? "Klik untuk ganti gambar" : "JPG, PNG, WEBP — maks 5MB"}
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </div>

          

          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1f2937", margin: "0 0 20px" }}>Pengaturan</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Kategori</label>
              <select value={form.kategori_id} onChange={(e) => setForm({ ...form, kategori_id: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">-- Tanpa Kategori --</option>
                {kategoris.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Produk Aktif (tampil di toko)</span>
            </label>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", background: "#FF5C00", color: "white", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: "pointer" }}>
            {loading ? "Menyimpan..." : produk?.id ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </div>
      </div>
    </form>
  );
}
