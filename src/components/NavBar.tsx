"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname === href
      ? "underline underline-offset-2"
      : "hover:underline underline-offset-2";

  return (
    <nav className="flex justify-end items-center gap-2 font-bold text-sm">
      <Link href="/" className={linkClass("/")}>
        MONTH
      </Link>
      <span aria-hidden>/</span>
      <Link href="/week" className={linkClass("/week")}>
        WEEK
      </Link>
    </nav>
  );
}
