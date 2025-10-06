import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SignOutButton from "@/components/SignOutButton";

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
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pilates Scheduler</h1>
          <div className="flex gap-4 items-center">
            <NavBar />
            <SignOutButton />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
