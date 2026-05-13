import { createDirectAdminClient } from "@/lib/supabase/server";
import ResepForm from "@/components/admin/ResepForm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Edit Resep" };

export default async function EditResepPage({ params }: Props) {
  const { id } = await params;
  const supabase = createDirectAdminClient();
  const { data: resep } = await supabase.from("reseps").select("*").eq("id", id).single();
  if (!resep) notFound();
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Edit Resep</h1>
      <ResepForm resep={resep} />
    </div>
  );
}
