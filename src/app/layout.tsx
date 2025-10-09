import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SignOutButton from "@/components/SignOutButton";
import Providers from "./Providers";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Pilates Scheduler",
  description: "Pilates Scheduler",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  return (
    <html lang="en">
      <body className="antialiased p-10 font-mono">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pilates Scheduler</h1>
          <div className="flex gap-4 items-center">
            <NavBar />
            {session?.user ? <SignOutButton /> : null }
            
          </div>
        </header>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
