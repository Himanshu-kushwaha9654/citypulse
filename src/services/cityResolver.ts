import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * The frontend identifies cities by a stable text slug (e.g. 'jaipur'),
 * but every backend table's city_id column is a UUID foreign key into
 * public.cities. This resolves slug -> UUID once and caches it, so
 * every service call can keep accepting the same slug the UI already
 * uses (selectedCityConfig.id) without needing a UUID plumbed through
 * everywhere.
 */
const slugToDbId = new Map<string, string>();
let inFlight: Promise<void> | null = null;

async function loadAllCities(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { data, error } = await supabase.from('cities').select('id, name');
  if (error || !data) return;
  data.forEach((row: { id: string; name: string }) => {
    if (row.name) slugToDbId.set(row.name.toLowerCase(), row.id);
  });
}

export async function resolveCityDbId(slug: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const normalized = slug.toLowerCase();
  if (slugToDbId.has(normalized)) return slugToDbId.get(normalized)!;

  if (!inFlight) {
    inFlight = loadAllCities().finally(() => {
      inFlight = null;
    });
  }
  await inFlight;

  return slugToDbId.get(normalized) ?? null;
}

/** Clears the cache - mainly useful for tests. */
export function clearCityResolverCache() {
  slugToDbId.clear();
}
