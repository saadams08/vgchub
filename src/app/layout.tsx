import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VGCHub — Competitive Pokémon Champions Team Builds",
  description:
    "Browse, share, and discover competitive Pokémon Champions team builds for Singles and Doubles. Community-powered teambuilding hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-600">
          © 2025 VGCHub — Competitive Pokémon Champions Community
        </footer>
      </body>
    </html>
  );
}
