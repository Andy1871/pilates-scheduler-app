// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/", "/week",
  ],
};
