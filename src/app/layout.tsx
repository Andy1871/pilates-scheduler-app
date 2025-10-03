import type { Metadata } from "next";

import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Pilates Scheduler",
  description: "Pilates Scheduler",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased p-10 font-mono">
        <header className="mb-8">
          <h1 className="mb-5 text-3xl font-bold">Pilates Scheduler</h1>

          <NavBar />
        </header>

        {children}
      </body>
    </html>
  );
}
