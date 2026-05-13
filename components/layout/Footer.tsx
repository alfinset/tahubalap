import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-on-surface text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-black text-xl mb-4">
              <span className="text-2xl">🏎️</span>
              <span>Tahu <span className="text-primary-container">Balap</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nikmati cita rasa street food otentik dengan standar kebersihan modern.
              Tahu segar berkualitas tinggi dari pengrajin lokal terpercaya.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Menu</h3>
            <div className="flex flex-col gap-2">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/resep", label: "Resep" },
                { href: "/keranjang", label: "Keranjang" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Kontak</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>location_on</span>
                Jl. Tahu Balap No. 1, Indonesia
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>phone</span>
                +62 812 3456 7890
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>mail</span>
                info@tahubalap.com
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tahu Balap. All rights reserved.</p>
          <p>Made with ❤️ for tahu lovers</p>
        </div>
      </div>
    </footer>
  );
}
