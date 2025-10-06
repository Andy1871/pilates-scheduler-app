// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  // Run auth on all paths EXCEPT these public ones
  matcher: [
    "/((?!signin|api/_debug-db|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
