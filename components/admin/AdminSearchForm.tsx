"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Props {
  defaultValue: string;
  basePath: string;
  placeholder?: string;
  extraParams?: Record<string, string>; // misal { status: "menunggu" }
}

export default function AdminSearchForm({ defaultValue, basePath, placeholder = "Cari...", extraParams = {} }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);

  const buildUrl = (search: string) => {
    const parts: string[] = [];
    Object.entries(extraParams).forEach(([k, v]) => { if (v) parts.push(`${k}=${encodeURIComponent(v)}`); });
    if (search.trim()) parts.push(`search=${encodeURIComponent(search.trim())}`);
    return parts.length ? `${basePath}?${parts.join("&")}` : basePath;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl(value));
  };

  const handleClear = () => {
    setValue("");
    router.push(buildUrl(""));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div style={{ position: "relative", flex: 1 }}>
        <span className="material-symbols-outlined"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 20 }}>
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: "10px 40px 10px 40px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        />
        {value && (
          <button type="button" onClick={handleClear}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18 }}>
            ✕
          </button>
        )}
      </div>
      <button type="submit"
        style={{ padding: "10px 20px", background: "#FF5C00", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
        Cari
      </button>
    </form>
  );
}
