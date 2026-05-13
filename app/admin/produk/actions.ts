"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Admin client langsung dari @supabase/supabase-js, bypass RLS sepenuhnya
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── PRODUK ───────────────────────────────────────────────────────────────────

export async function simpanProduk(
  produkId: number | undefined,
  payload: Record<string, unknown>
) {
  const supabase = getAdminClient();
  if (produkId) {
    const { error } = await supabase.from("produks").update(payload).eq("id", produkId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("produks").insert(payload);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/produk");
  return { success: true };
}

export async function hapusProduk(produkId: number) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("produks").delete().eq("id", produkId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/produk");
  return { success: true };
}

// ─── KATEGORI ─────────────────────────────────────────────────────────────────

export async function simpanKategori(
  kategoriId: number | null,
  payload: Record<string, unknown>
) {
  const supabase = getAdminClient();
  if (kategoriId) {
    const { error } = await supabase.from("kategoris").update(payload).eq("id", kategoriId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("kategoris").insert(payload);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/kategori");
  return { success: true };
}

export async function hapusKategori(kategoriId: number) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("kategoris").delete().eq("id", kategoriId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/kategori");
  return { success: true };
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export async function simpanSettings(form: Record<string, string>) {
  const supabase = getAdminClient();
  for (const [key, value] of Object.entries(form)) {
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });
    if (error) return { success: false, error: error.message };
  }
  // Revalidate semua halaman yang menggunakan settings
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/resep");
  revalidatePath("/admin/setting");
  return { success: true };
}


// ─── RESEP ────────────────────────────────────────────────────────────────────

export async function simpanResep(
  resepId: number | undefined,
  payload: Record<string, unknown>
) {
  const supabase = getAdminClient();
  if (resepId) {
    const { error } = await supabase.from("reseps").update(payload).eq("id", resepId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("reseps").insert(payload);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/resep");
  revalidatePath("/resep");
  return { success: true };
}

export async function hapusResep(resepId: number) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("reseps").delete().eq("id", resepId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/resep");
  revalidatePath("/resep");
  return { success: true };
}


// ─── NOTIFIKASI ───────────────────────────────────────────────────────────────

export async function tandaiBacaSemuaNotifikasi(userId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/notifikasi");
  return { success: true };
}

export async function hapusSemuaNotifikasi(userId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/notifikasi");
  return { success: true };
}

// ─── PESANAN / PEMBAYARAN ─────────────────────────────────────────────────────

export async function updateStatusPesanan(pesananId: number, status: string) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("pesanans").update({ status }).eq("id", pesananId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/pesanan");
  return { success: true };
}

export async function konfirmasiPembayaran(pesananId: number) {
  const supabase = getAdminClient();
  const { error: e1 } = await supabase
    .from("pembayarans")
    .update({ status: "dikonfirmasi" })
    .eq("pesanan_id", pesananId);
  if (e1) return { success: false, error: e1.message };

  const { error: e2 } = await supabase
    .from("pesanans")
    .update({ status: "diproses" })
    .eq("id", pesananId);
  if (e2) return { success: false, error: e2.message };

  revalidatePath("/admin/pesanan");
  return { success: true };
}

export async function uploadBuktiPembayaran(
  pesananId: number,
  totalHarga: number,
  storagePath: string
) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("pembayarans").upsert(
    {
      pesanan_id: pesananId,
      metode_bayar: "transfer",
      jumlah_bayar: totalHarga,
      bukti_transfer: storagePath,
      status: "menunggu",
      tanggal_bayar: new Date().toISOString(),
    },
    { onConflict: "pesanan_id" }
  );
  if (error) return { success: false, error: error.message };
  revalidatePath("/pesanan");
  return { success: true };
}

// ─── NOTIFIKASI PESANAN BARU ──────────────────────────────────────────────────
// Dipanggil dari checkout page setelah pesanan dibuat
// Menggunakan service role agar bisa baca semua admin profiles & tulis notifikasi

export async function kirimNotifikasiPesananBaru(payload: {
  kode_pesanan: string;
  total_harga: number;
  customer_email: string;
}) {
  const supabase = getAdminClient();

  // Ambil semua admin
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return { success: true };

  const { error } = await supabase.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      type: "pesanan_baru",
      data: {
        kode_pesanan: payload.kode_pesanan,
        total_harga: payload.total_harga,
        customer: payload.customer_email,
      },
    }))
  );

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/notifikasi");
  return { success: true };
}

