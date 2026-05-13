import { createDirectAdminClient } from "@/lib/supabase/server";
import AdminSettingForm from "@/components/admin/AdminSettingForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Pengaturan Toko" };

export default async function AdminSettingPage() {
  const supabase = createDirectAdminClient();
  const { data: settings } = await supabase.from("settings").select("*");
  const settingsMap = Object.fromEntries((settings ?? []).map((s: any) => [s.key, s.value]));

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1f2937", marginBottom: 28 }}>Pengaturan Toko</h1>
      <AdminSettingForm settings={settingsMap} />
    </div>
  );
}

