// Quick smoke test for the Supabase backend. Reads connection details
// from .env (same file Vite uses) instead of hardcoding the anon key,
// and resolves Jaipur's city id by slug instead of assuming a fixed
// UUID, since that's how the app itself does it (see
// src/services/cityResolver.ts).
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const idx = trimmed.indexOf('=');
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);

  console.log('----------------------------------------');
  console.log('1. Checking Database Connection (cities table)...');
  const { data: cities, error: citiesError } = await supabase.from('cities').select('id, name, slug').order('name');

  if (citiesError) {
    console.error('❌ Database connection failed!', citiesError.message);
    return;
  }
  console.log(`✅ Database connected. ${cities.length} cities found:`, cities.map((c) => c.slug || c.name).join(', '));

  const jaipur = cities.find((c) => (c.slug || c.name.toLowerCase()) === 'jaipur');
  if (!jaipur) {
    console.warn('⚠️ No Jaipur row found - has the migration been applied yet? (see supabase/SETUP.md)');
    return;
  }

  console.log('\n----------------------------------------');
  console.log('2. Checking RPC functions...');
  const { error: rpcError } = await supabase.rpc('get_latest_city_metrics', { p_city_id: jaipur.id });
  console.log(rpcError ? `❌ RPC failed: ${rpcError.message}` : '✅ get_latest_city_metrics responded.');

  console.log('\n----------------------------------------');
  console.log('3. Checking alert_thresholds table...');
  const { error: thresholdError } = await supabase.from('alert_thresholds').select('id').limit(1);
  console.log(thresholdError ? `❌ alert_thresholds failed: ${thresholdError.message}` : '✅ alert_thresholds reachable.');

  console.log('\n----------------------------------------');
  console.log('4. Checking Edge Function deployment (expects 401 without a session - that still means it is deployed)...');
  try {
    const { error: edgeError } = await supabase.functions.invoke('ingest-telemetry', {
      body: { cityId: jaipur.id, type: 'demo-step', payload: {} }
    });
    if (edgeError) {
      console.log(`ℹ️ Edge Function responded with an error (expected if not signed in as operator/admin): ${edgeError.message || edgeError.context?.statusText || edgeError}`);
    } else {
      console.log('✅ Edge Function is deployed and responding.');
    }
  } catch (e) {
    console.error('❌ Edge Function network request failed (likely not deployed):', e.message);
  }
  console.log('----------------------------------------');
}

main();
