import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tahu Balap - Tahu Segar Berkualitas",
    template: "%s | Tahu Balap",
  },
  description:
    "Nikmati cita rasa street food otentik dengan standar kebersihan modern. Tahu segar berkualitas tinggi dari pengrajin lokal terpercaya.",
  keywords: ["tahu", "tahu balap", "tahu segar", "toko tahu", "jual tahu"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
