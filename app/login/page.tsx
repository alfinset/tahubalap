"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant">
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>{error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">Password</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-primary-container text-white font-black py-4 rounded-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p className="text-center text-sm text-on-surface-variant mt-6">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary-container font-bold hover:underline">Daftar sekarang</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl text-on-surface mb-6">
            <span className="text-3xl">🏎️</span>
            <span>Tahu <span className="text-primary-container">Balap</span></span>
          </Link>
          <h1 className="text-headline-md font-black text-on-surface">Masuk ke Akun</h1>
          <p className="text-on-surface-variant text-sm mt-2">Selamat datang kembali!</p>
        </div>
        <Suspense fallback={<div className="bg-white rounded-3xl p-8 text-center text-on-surface-variant">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
