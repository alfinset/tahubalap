import { createDirectAdminClient } from "@/lib/supabase/server";
import KategoriCRUD from "@/components/admin/KategoriCRUD";
import AdminSearchForm from "@/components/admin/AdminSearchForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kelola Kategori" };
interface Props { searchParams: Promise<{ search?: string }> }

export default async function AdminKategoriPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = createDirectAdminClient();
  const { data: allKategoris } = await supabase.from("kategoris").select("*").order("id");

  const q = params.search?.toLowerCase() ?? "";
  const kategoris = q
    ? (allKategoris ?? []).filter((k: any) =>
        k.nama?.toLowerCase().includes(q) ||
        k.slug?.toLowerCase().includes(q) ||
        k.deskripsi?.toLowerCase().includes(q)
      )
    : (allKategoris ?? []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 20 }}>Kelola Kategori</h1>
      <AdminSearchForm defaultValue={params.search ?? ""} basePath="/admin/kategori" placeholder="Cari nama, slug, deskripsi kategori..." />
      <KategoriCRUD kategoris={kategoris} searchQuery={q} />
    </div>
  );
}
