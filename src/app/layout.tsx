import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pilates Scheduler",
  description: "Pilates Scheduler",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased p-10 font-mono">
        <header className="mb-8">
          <h1 className="mb-5 text-3xl font-bold">Pilates Scheduler</h1>

          <nav className="flex justify-end items-center gap-3 font-bold text-sm">
            <Link href="/" className="underline underline-offset-2">MONTH</Link>
            <span aria-hidden>/</span>
            <Link href="/week" className="hover:underline underline-offset-2">WEEK</Link>
            <span aria-hidden>/</span>
            <Link href="/day" className="hover:underline underline-offset-2">DAY</Link>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
