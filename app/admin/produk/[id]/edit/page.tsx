import { createDirectAdminClient } from "@/lib/supabase/server";
import ProdukForm from "@/components/admin/ProdukForm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Edit Produk" };

export default async function EditProdukPage({ params }: Props) {
  const { id } = await params;
  const supabase = createDirectAdminClient();
  const [{ data: produk }, { data: kategoris }] = await Promise.all([
    supabase.from("produks").select("*").eq("id", id).single(),
    supabase.from("kategoris").select("id, nama").order("nama"),
  ]);
  if (!produk) notFound();
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Edit Produk</h1>
      <ProdukForm kategoris={kategoris ?? []} produk={produk} />
    </div>
  );
}
