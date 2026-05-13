"use client";
import { createClient } from "@/lib/supabase/client";
import { uploadBuktiPembayaran } from "@/app/admin/produk/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils/format";

interface Props { kodePesanan: string; pesananId: number; totalHarga: number; }

export default function UploadBuktiForm({ kodePesanan, pesananId, totalHarga }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient(); // hanya untuk upload storage (tidak kena RLS)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setError("Ukuran file maksimal 2MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Pilih file bukti transfer"); return; }
    setLoading(true); setError("");

    const ext = file.name.split(".").pop();
    const path = `pembayaran/${pesananId}_${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
    if (upErr) { setError("Gagal upload file: " + upErr.message); setLoading(false); return; }

    // Simpan record ke DB via Server Action (bypass RLS)
    const result = await uploadBuktiPembayaran(pesananId, totalHarga, `uploads/${path}`);
    if (!result.success) { setError("Gagal simpan bukti: " + result.error); setLoading(false); return; }

    router.refresh();
    setLoading(false);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
      <h2 className="font-black text-on-surface mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container">upload_file</span>Upload Bukti Transfer
      </h2>
      <p className="text-sm text-on-surface-variant mb-5">
        Transfer ke rekening BCA 1234567890 a/n Tahu Balap sebesar <strong className="text-primary-container">{formatRupiah(totalHarga)}</strong>, lalu upload bukti di bawah.
      </p>
      {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
      <form onSubmit={handleUpload} className="space-y-4">
        <label className="block border-2 border-dashed border-orange-300 rounded-xl p-6 text-center cursor-pointer hover:bg-orange-100 transition-all">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
          ) : (
            <div>
              <span className="material-symbols-outlined text-primary-container text-4xl block mb-2">add_photo_alternate</span>
              <p className="text-sm font-bold text-on-surface">Klik untuk pilih gambar</p>
              <p className="text-xs text-on-surface-variant mt-1">JPG, PNG, max 2MB</p>
            </div>
          )}
        </label>
        <button type="submit" disabled={loading || !file}
          className="w-full bg-primary-container text-white font-bold py-3 rounded-xl hover:bg-primary transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">send</span>
          {loading ? "Mengupload..." : "Kirim Bukti Pembayaran"}
        </button>
      </form>
    </div>
  );
}
