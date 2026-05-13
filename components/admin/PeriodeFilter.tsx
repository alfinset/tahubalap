"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function PeriodeFilter({ currentPeriode }: { currentPeriode: number }) {
  const router = useRouter();
  return (
    <select
      defaultValue={currentPeriode}
      onChange={(e) => router.push(`/admin/dashboard?periode=${e.target.value}`)}
      style={{
        border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12,
        padding: "6px 12px", color: "#6b7280", fontWeight: 700,
        background: "white", cursor: "pointer",
      }}
    >
      <option value="7">7 hari terakhir</option>
      <option value="30">30 hari terakhir</option>
    </select>
  );
}
