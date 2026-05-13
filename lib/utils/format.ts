// Format angka ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format tanggal ke bahasa Indonesia
export function formatTanggal(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

// Format tanggal singkat
export function formatTanggalSingkat(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Generate kode pesanan
export function generateKodePesanan(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TH-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Status badge style
export function getStatusStyle(status: string): {
  bg: string;
  text: string;
  label: string;
} {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    menunggu: { bg: "bg-orange-50", text: "text-orange-600", label: "Menunggu" },
    diproses: { bg: "bg-blue-50", text: "text-blue-600", label: "Diproses" },
    dikirim: { bg: "bg-purple-50", text: "text-purple-600", label: "Dikirim" },
    selesai: { bg: "bg-green-50", text: "text-green-600", label: "Selesai" },
    dibatalkan: { bg: "bg-red-50", text: "text-red-500", label: "Dibatalkan" },
    dikonfirmasi: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Dikonfirmasi" },
  };
  return styles[status] ?? { bg: "bg-gray-100", text: "text-gray-600", label: status };
}

// Get Supabase Storage public URL
export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Normalise path: pastikan selalu ada prefix "uploads/"
  const normalised = path.startsWith("uploads/") ? path : `uploads/${path}`;
  return `${supabaseUrl}/storage/v1/object/public/${normalised}`;
}

