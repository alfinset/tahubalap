"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password !== form.password_confirmation) { setError("Password tidak cocok."); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError("Gagal mendaftar: " + signUpError.message);
      setLoading(false);
      return;
    }

    // Cek apakah user langsung aktif (email confirmation dinonaktifkan)
    // atau perlu konfirmasi email
    if (data.user && data.session) {
      // Langsung aktif — buat profile dan redirect
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: form.name,
        email: form.email,
        role: "customer",
      });
      router.push("/");
      router.refresh();
    } else if (data.user && !data.session) {
      // Perlu konfirmasi email
      setSuccess(
        `Akun berhasil dibuat! Cek email di ${form.email} untuk konfirmasi, lalu login.`
      );
      setLoading(false);
    } else {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl text-on-surface mb-6">
            <span className="text-3xl">🏎️</span>
            <span>Tahu <span className="text-primary-container">Balap</span></span>
          </Link>
          <h1 className="text-headline-md font-black text-on-surface">Buat Akun Baru</h1>
          <p className="text-on-surface-variant text-sm mt-2">Bergabung dengan ribuan pelanggan kami</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
              <div>
                <p>{error}</p>
                {error.includes("email") && (
                  <p className="mt-2 text-xs text-red-500">
                    💡 Tip: Nonaktifkan konfirmasi email di Supabase → Authentication → Settings → uncentang "Enable email confirmations"
                  </p>
                )}
              </div>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">mark_email_read</span>
              <div>
                <p className="font-bold">{success}</p>
                <p className="mt-1 text-xs text-green-600">
                  Atau nonaktifkan konfirmasi email di Supabase untuk langsung login tanpa verifikasi.
                </p>
                <Link href="/login" className="inline-block mt-2 text-green-700 font-bold underline text-xs">
                  Sudah konfirmasi? Login di sini →
                </Link>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleRegister} className="space-y-5">
              {[
                { label: "Nama Lengkap", name: "name", type: "text", placeholder: "Nama Anda" },
                { label: "Email", name: "email", type: "email", placeholder: "email@contoh.com" },
                { label: "Password", name: "password", type: "password", placeholder: "Min. 6 karakter" },
                { label: "Konfirmasi Password", name: "password_confirmation", type: "password", placeholder: "Ulangi password" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-bold text-on-surface mb-2">{field.label}</label>
                  <input
                    type={field.type} required placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:border-primary-container text-sm"
                  />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full bg-primary-container text-white font-black py-4 rounded-xl hover:bg-primary transition-all active:scale-95 disabled:opacity-60">
                {loading ? "Mendaftar..." : "Daftar Sekarang"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary-container font-bold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
