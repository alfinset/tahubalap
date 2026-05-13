"use client";
/**
 * RealtimeRefresher — komponen client yang berlangganan perubahan Supabase
 * dan memanggil router.refresh() untuk memperbarui data Server Component
 * tanpa full page reload.
 *
 * Cara pakai: taruh di dalam layout atau page yang ingin real-time.
 * <RealtimeRefresher tables={["pesanans", "notifications"]} />
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  tables: string[];
  /** Debounce ms sebelum refresh (default: 500ms) */
  debounceMs?: number;
}

export default function RealtimeRefresher({ tables, debounceMs = 500 }: Props) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const triggerRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.refresh();
      }, debounceMs);
    };

    const channels = tables.map((table) =>
      supabase
        .channel(`realtime-${table}-${Math.random()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => triggerRefresh()
        )
        .subscribe()
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [tables.join(",")]);

  // Tidak render apapun — hanya logic
  return null;
}
