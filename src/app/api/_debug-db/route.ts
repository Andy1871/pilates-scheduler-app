// src/app/api/_debug-db/route.ts
export const dynamic = "force-dynamic"; // don't prerender
export const runtime = "nodejs";        // force Node runtime

export async function GET() {
  try {
    const db = process.env.DATABASE_URL || "";
    const direct = process.env.DIRECT_URL || "";
    const dbUrl = db ? new URL(db) : null;
    const directUrl = direct ? new URL(direct) : null;

    return new Response(
      JSON.stringify(
        {
          DATABASE_URL: dbUrl
            ? { host: dbUrl.hostname, port: dbUrl.port, search: dbUrl.search }
            : "not set",
          DIRECT_URL: directUrl
            ? {
                host: directUrl.hostname,
                port: directUrl.port,
                search: directUrl.search,
              }
            : "not set",
        },
        null,
        2
      ),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
