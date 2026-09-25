# CityPulse Backend Setup

## Why this is a manual step

Claude Code is blocked by policy from connecting directly to a live/production
database (this project's Supabase Postgres instance) with an elevated
credential, even for read-only inspection, and the same restriction applies
to `supabase db push`/`supabase link` since those use the identical direct
DB connection under the hood. Everything that *can* be prepared as local
files - schema, RLS policies, functions, triggers, frontend code - has been
written and verified (typechecked + built). Applying the SQL to the live
project is the one step that has to be done from your own Supabase account.

## 1. Apply the migration (required, ~30 seconds)

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) → your
   project (`thcemppftndfpkujbijq`) → **SQL Editor**.
2. Open [`supabase/migrations/20260926000000_citypulse_auth_rbac_and_fixes.sql`](./migrations/20260926000000_citypulse_auth_rbac_and_fixes.sql),
   copy the whole file, paste it into a new query, and click **Run**.
3. It's written to be safe to re-run if you ever need to (uses
   `IF NOT EXISTS` / `CREATE OR REPLACE` / dynamic constraint discovery
   throughout - it doesn't assume what state the DB is currently in).

This one migration:
- Adds a `slug` column to `cities` (`jaipur`, `delhi`, ...) - the frontend
  was passing this text slug straight into a `city_id` UUID filter, which
  silently failed every query and fell back to mock data.
- Creates `alert_thresholds` (was missing entirely) and the three RPC
  functions the frontend calls (were missing entirely - schema-cache 404s).
- Standardizes `alerts.severity` onto the same `(low, medium, high,
  critical)` domain the rest of the schema and `services/alerts.ts` already
  use (the live table only allowed `info/warning/critical`, so every
  threshold-triggered alert insert was failing).
- Adds `profiles` (roles), the signup trigger, role-check helper functions,
  and a trigger that blocks a user from promoting themselves.
- Replaces every "anyone can write" RLS policy with role-gated ones.

### Verify it worked

Run in the same SQL Editor:
```sql
select id, slug, name from public.cities order by name;   -- 8 rows, each with a slug
select proname from pg_proc where pronamespace = 'public'::regnamespace
  and proname like 'get_%city%';                          -- 3 rows
select policyname, cmd from pg_policies where tablename = 'alerts';
```

## 2. Roles (RBAC)

| Role | Who | Can do |
|---|---|---|
| `viewer` | Default for every new signup | Read everything (dashboard, map, alerts, insights). No writes. |
| `operator` | Day-to-day ops/dispatch | Everything `viewer` can, plus insert civic events/metrics/anomalies/alerts/insights, acknowledge/resolve alerts, manage alert thresholds. |
| `admin` | You | Everything `operator` can, plus manage cities/data sources, and change other users' roles. |

Enforcement is in the database (RLS policies), not just the UI - even if
someone bypasses the frontend and calls the Supabase API directly, the same
rules apply. The frontend additionally reads `canManageBackend` /
`isAdmin` off `useCityPulse()` to disable/hide write controls for viewers
(see `src/components/alerts/AlertPreferences.tsx` for an example).

### Getting your first admin account

The migration bootstraps **`fieldgamer789@gmail.com`** as `admin`
automatically - sign up with that exact email address (via the app's Sign Up
form, or Dashboard → Authentication → Users → Add User) and the
`handle_new_user()` trigger sets your role to `admin` instead of the default
`viewer`. No manual SQL required.

To promote someone else later, once you're signed in as admin, run from the
app's browser console (or any authenticated client):
```js
await supabase.rpc('admin_set_user_role', {
  target_user_id: '<their-auth-user-id>',
  new_role: 'operator' // or 'admin' / 'viewer'
});
```
Or directly in the SQL Editor: `update public.profiles set role = 'operator' where email = '...';`

## 3. Edge Function (optional for MVP)

`supabase/functions/ingest-telemetry` is a second write path (an HTTP
endpoint instead of writing to Supabase directly from the browser). It's
**not required** - the app's primary path (`DemoEngineContext`, the various
`services/*.ts` files) already writes directly via the Supabase client,
protected by the same RLS policies. Deploy it only if you want an external
system to be able to push telemetry in over HTTP.

It now requires a signed-in operator/admin JWT (`verify_jwt = true` in
`config.toml`, plus its own role check) - it used to run with
`verify_jwt = false`, i.e. open to the internet. To deploy:

```powershell
npx supabase login          # opens a browser - has to be run by you, not automatable here
npx supabase link --project-ref thcemppftndfpkujbijq
npx supabase functions deploy ingest-telemetry
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically into every deployed function's runtime by the
platform - nothing to configure.

## 4. Security note: rotate the database password

`check_rls.cjs` previously had the Postgres superuser password committed in
plain text in this folder (which syncs to OneDrive). It's been rewritten to
read `SUPABASE_DB_URL` from the environment instead, but the **old password
value should still be rotated**: Dashboard → Project Settings → Database →
Reset database password. This doesn't affect `VITE_SUPABASE_ANON_KEY` in
`.env` - that one is meant to be public and is safe as long as RLS (applied
above) is in place.
