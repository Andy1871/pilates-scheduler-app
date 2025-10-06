// middleware.ts
export { auth as middleware } from "@/auth";

// Run auth on everything EXCEPT these public paths
export const config = {
  matcher: [
    "/((?!signin|api/_debug-db|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
