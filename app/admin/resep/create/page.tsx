import ResepForm from "@/components/admin/ResepForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Tambah Resep" };
export default function CreateResepPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Tambah Resep Baru</h1>
      <ResepForm />
    </div>
  );
}
