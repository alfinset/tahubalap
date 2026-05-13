"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface Props { defaultValue: string; currentStatus?: string; }

export default function PesananSearchForm({ defaultValue, currentStatus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = "/admin/pesanan";
    const parts: string[] = [];
    if (currentStatus) parts.push(`status=${currentStatus}`);
    if (value.trim()) parts.push(`search=${encodeURIComponent(value.trim())}`);
    router.push(parts.length ? `${base}?${parts.join("&")}` : base);
  };

  const handleClear = () => {
    setValue("");
    const base = "/admin/pesanan";
    router.push(currentStatus ? `${base}?status=${currentStatus}` : base);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{ position: "relative", flex: 1 }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 20 }}>search</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari kode pesanan, nama, email, status..."
          style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        />
        {value && (
          <button type="button" onClick={handleClear}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1 }}>
            ✕
          </button>
        )}
      </div>
      <button type="submit" style={{ padding: "10px 20px", background: "#FF5C00", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        Cari
      </button>
    </form>
  );
}
