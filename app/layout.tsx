import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SigmaScope - Web3 Security & Ecosystem Hub",
  description:
    "A TAM-oriented portal: Ethereum network pulse, audit scoping, and a smart-contract vulnerability archive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-12 text-xs text-zinc-500 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-6">
            <span>
              SigmaScope · Built as a TAM portfolio piece. Not affiliated with Sigma Prime.
            </span>
            <span className="mono">
              data: beaconcha.in · client diversity: clientdiversity.org
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
