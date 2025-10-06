export const dynamic = "force-dynamic";

export async function GET() {
  const db = process.env.DATABASE_URL || "";
  const direct = process.env.DIRECT_URL || "";
  const dbUrl = db ? new URL(db) : null;
  const directUrl = direct ? new URL(direct) : null;

  return Response.json({
    DATABASE_URL: db ? {
      host: dbUrl?.hostname, port: dbUrl?.port, search: dbUrl?.search
    } : "not set",
    DIRECT_URL: direct ? {
      host: directUrl?.hostname, port: directUrl?.port, search: directUrl?.search
    } : "not set",
  });
}
