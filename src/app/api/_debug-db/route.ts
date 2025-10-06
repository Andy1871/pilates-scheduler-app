// src/app/api/_debug-db/route.ts
export const dynamic = "force-dynamic"; // don't prerender
export const runtime = "nodejs";        // ensure Node runtime (not Edge)

export async function GET() {
  const out = {} as Record<string, unknown>;

  try {
    const db = process.env.DATABASE_URL || "";
    const direct = process.env.DIRECT_URL || "";
    const dbUrl = db ? new URL(db) : null;
    const directUrl = direct ? new URL(direct) : null;

    out.DATABASE_URL = dbUrl
      ? { host: dbUrl.hostname, port: dbUrl.port, search: dbUrl.search }
      : "not set";

    out.DIRECT_URL = directUrl
      ? { host: directUrl.hostname, port: directUrl.port, search: directUrl.search }
      : "not set";
  } catch (e: any) {
    out.error = String(e?.message || e);
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
