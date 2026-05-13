import { createDirectAdminClient } from "@/lib/supabase/server";
import ProdukForm from "@/components/admin/ProdukForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Tambah Produk" };

export default async function CreateProdukPage() {
  const supabase = createDirectAdminClient();
  const { data: kategoris } = await supabase.from("kategoris").select("id, nama").order("nama");
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Tambah Produk Baru</h1>
      <ProdukForm kategoris={kategoris ?? []} />
    </div>
  );
}

