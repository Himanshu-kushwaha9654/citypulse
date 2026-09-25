// Reads DB connection details from environment variables instead of
// hardcoding a password in the file (the previous version had the
// Postgres superuser password committed in plain text). Get the
// connection string from Supabase Dashboard -> Project Settings ->
// Database -> Connection string, and export it before running:
//
//   SUPABASE_DB_URL="postgres://postgres:<password>@db.<ref>.supabase.co:5432/postgres" node check_rls.cjs
//
// IMPORTANT: if that password was ever committed/shared (as it was
// here), rotate it in the dashboard - Project Settings -> Database ->
// Reset database password.
const { Client } = require('pg');

async function checkRLS() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error('Set SUPABASE_DB_URL before running this script (see comment at top of file).');
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    console.log("--- RLS STATUS ---");
    const rlsQuery = `
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relnamespace = 'public'::regnamespace
      AND relkind = 'r'
      ORDER BY relname;
    `;
    const rlsRes = await client.query(rlsQuery);
    rlsRes.rows.forEach(r => {
      console.log(`${r.relname}: ${r.relrowsecurity ? 'ENABLED' : 'DISABLED'}`);
    });

    console.log("\n--- RLS POLICIES ---");
    const polQuery = `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
    const polRes = await client.query(polQuery);

    if (polRes.rows.length === 0) {
      console.log("No RLS policies found.");
    } else {
      polRes.rows.forEach(r => {
        console.log(`Table: ${r.tablename}`);
        console.log(`Policy Name: ${r.policyname}`);
        console.log(`Command: ${r.cmd}`);
        console.log(`Role: ${r.roles}`);
        console.log(`USING: ${r.qual || 'N/A'}`);
        console.log(`WITH CHECK: ${r.with_check || 'N/A'}`);
        console.log('---');
      });
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

checkRLS();
