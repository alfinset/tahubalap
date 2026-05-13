import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RealtimeRefresher from "@/components/RealtimeRefresher";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        {/* Auto-refresh saat ada perubahan produk atau pesanan */}
        <RealtimeRefresher tables={["produks", "pesanans", "kategoris"]} debounceMs={800} />
        {children}
      </main>
      <Footer />
    </>
  );
}
