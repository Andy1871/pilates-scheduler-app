const u = new URL(process.env.DIRECT_URL || '');
console.log('🧩 DIRECT_URL in Vercel →');
console.log({
  host: u.hostname,
  port: u.port,
  search: u.search,
  starts: (process.env.DIRECT_URL || '').slice(0, 40),
  ends: (process.env.DIRECT_URL || '').slice(-20),
});
