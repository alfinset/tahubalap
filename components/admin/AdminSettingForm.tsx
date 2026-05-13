"use client";
import { createClient } from "@/lib/supabase/client";
import { simpanSettings } from "@/app/admin/produk/actions";
import { getStorageUrl } from "@/lib/utils/format";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const SETTING_FIELDS = [
  { key: "nama_toko", label: "Nama Toko", placeholder: "Tahu Balap" },
  { key: "deskripsi_toko", label: "Deskripsi Toko", placeholder: "Toko tahu terbaik...", multiline: true },
  { key: "hero_badge", label: "Hero Badge Text", placeholder: "Freshly Racing to Your Table 🏎️" },
  { key: "hero_title", label: "Hero Title", placeholder: "Rasakan Tahu Balap yang Cepat & Lezat" },
  { key: "hero_subtitle", label: "Hero Subtitle", placeholder: "Nikmati cita rasa street food otentik...", multiline: true },
  { key: "telepon_toko", label: "Nomor Telepon Toko", placeholder: "+62 812 3456 7890" },
  { key: "alamat_toko", label: "Alamat Toko", placeholder: "Jl. Tahu Balap No. 1", multiline: true },
  { key: "email_toko", label: "Email Toko", placeholder: "info@tahubalap.com" },
  { key: "rekening_bank", label: "Rekening Bank (untuk Transfer)", placeholder: "BCA 1234567890 a/n Tahu Balap", multiline: true },
];

export default function AdminSettingForm({ settings }: { settings: Record<string, string> }) {
  const supabase = createClient(); // hanya untuk upload storage
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Record<string, string>>(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const handleHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setHeroPreview(URL.createObjectURL(f));
    setLoading(true);
    const ext = f.name.split(".").pop();
    const path = `settings/hero_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("uploads").upload(path, f, { upsert: true });
    if (upErr) { setError("Gagal upload gambar: " + upErr.message); setLoading(false); return; }
    setForm((prev) => ({ ...prev, hero_gambar: `uploads/${path}` }));
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await simpanSettings(form);
    if (!result.success) { setError("Gagal simpan: " + result.error); setLoading(false); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
    router.refresh();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" };

  const currentHeroUrl = heroPreview ?? (form.hero_gambar ? getStorageUrl(form.hero_gambar) : null);

  return (
    <form onSubmit={handleSubmit}>
      {saved && (
        <div style={{ marginBottom: 20, padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, color: "#16a34a", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined">check_circle</span> Pengaturan berhasil disimpan!
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 20, padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#ef4444", fontSize: 14 }}>{error}</div>
      )}

      {/* Gambar Hero */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 24, marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>
          Gambar Hero (kotak besar di halaman utama)
        </label>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Preview sesuai tampilan di beranda */}
          <div
            className="w-full aspect-square max-w-md bg-primary-fixed rounded-[2rem] flex items-center justify-center text-8xl shadow-2xl rotate-3"
            style={{ width: 180, height: 180, borderRadius: "2rem", background: "#FFE4D6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transform: "rotate(3deg)", flexShrink: 0 }}
          >
            {currentHeroUrl ? (
              <img src={currentHeroUrl} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <span style={{ fontSize: 64 }}>🧀</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Gambar ini ditampilkan dalam kotak <code>w-full aspect-square max-w-md bg-primary-fixed rounded-[2rem]</code> di halaman beranda.</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ padding: "10px 20px", background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {currentHeroUrl ? "Ganti Gambar Hero" : "Upload Gambar Hero"}
            </button>
            {form.hero_gambar && (
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Path: {form.hero_gambar}</p>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleHeroImage} style={{ display: "none" }} />
          </div>
        </div>
      </div>

      {/* Field lainnya */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {SETTING_FIELDS.map((field) => (
          <div key={field.key} style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", padding: 20, gridColumn: field.multiline ? "1 / -1" : "auto" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{field.label}</label>
            {field.multiline ? (
              <textarea rows={3} value={form[field.key] ?? ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder} style={{ ...inputStyle, resize: "vertical" }} />
            ) : (
              <input type="text" value={form[field.key] ?? ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder} style={inputStyle} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, textAlign: "right" }}>
        <button type="submit" disabled={loading}
          style={{ padding: "12px 32px", background: "#FF5C00", color: "white", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: "pointer" }}>
          {loading ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}
