import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

// civic_events.type is a DB CHECK constraint limited to these values.
// UI-shaped callers may send SignalType-flavoured strings (e.g.
// 'airQuality', 'incidents', 'utilities') - normalize defensively.
function toDbEventType(type: string | undefined): string {
  switch (type) {
    case 'airQuality':
    case 'air_quality':
      return 'air_quality';
    case 'incidents':
    case 'incident':
    case 'noise':
      return 'incident';
    case 'utilities':
    case 'utility':
    case 'water':
      return 'utility';
    case 'traffic':
    case 'weather':
    case 'transit':
      return type;
    default:
      return 'incident';
  }
}

// alerts.severity is standardized on ('low' | 'medium' | 'high' | 'critical').
function toDbSeverity(severity: string | undefined): string {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
    case 'warning':
      return 'medium';
    case 'low':
    case 'info':
      return 'low';
    default:
      return 'medium';
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');

    if (!accessToken) {
      return jsonResponse({ error: 'Missing Authorization bearer token' }, 401);
    }

    // Client scoped to the calling user's JWT - used only to identify who
    // is calling and check their role. All writes below use the service
    // role client so they aren't blocked by RLS (the role check here IS
    // the access control for this function).
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await callerClient.auth.getUser(accessToken);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: 'Invalid or expired session' }, 401);
    }

    const { data: profile, error: profileErr } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (profileErr || !profile || !['operator', 'admin'].includes(profile.role)) {
      return jsonResponse({ error: 'Forbidden: requires operator or admin role' }, 403);
    }

    // Service-role client for the actual writes (bypasses RLS; safe here
    // because the role check above is the gate).
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { cityId, type, payload } = await req.json();
    if (!cityId) return jsonResponse({ error: 'cityId is required' }, 400);
    if (type !== 'demo-step') return jsonResponse({ error: 'Unknown payload type' }, 400);

    const step = payload ?? {};
    const inserts: Promise<unknown>[] = [];
    const errors: string[] = [];

    const track = (label: string, p: PromiseLike<{ error: { message: string } | null }>) => {
      inserts.push(
        Promise.resolve(p).then((r) => {
          if (r.error) errors.push(`${label}: ${r.error.message}`);
        })
      );
    };

    if (step.mapIncident) {
      track('civic_events', serviceClient.from('civic_events').insert({
        city_id: cityId,
        type: toDbEventType(step.mapIncident.type) || 'incident',
        title: step.mapIncident.title,
        description: step.mapIncident.description,
        latitude: step.mapIncident.location?.lat,
        longitude: step.mapIncident.location?.lng,
        severity: step.mapIncident.severity || 'medium',
        value: step.mapIncident.value,
        source: 'demo_engine'
      }));
    }

    if (step.anomalyItem) {
      track('anomalies', serviceClient.from('anomalies').insert({
        city_id: cityId,
        metric_type: step.anomalyItem.category,
        observed_value: step.anomalyItem.currentValue,
        baseline_value: step.anomalyItem.baselineValue,
        deviation: step.anomalyItem.factorAboveBaseline,
        severity: step.anomalyItem.severity || 'high',
        explanation: step.anomalyItem.description,
        metadata: { relatedSignals: step.anomalyItem.relatedSignals }
      }));
    }

    if (step.alertItem) {
      track('alerts', serviceClient.from('alerts').insert({
        city_id: cityId,
        type: step.alertItem.type || 'info',
        title: step.alertItem.title,
        message: step.alertItem.message,
        severity: toDbSeverity(step.alertItem.severity),
        metric_type: step.alertItem.type,
        acknowledged: false
      }));
    } else if (step.newAlertTitle) {
      track('alerts', serviceClient.from('alerts').insert({
        city_id: cityId,
        type: 'info',
        title: step.newAlertTitle,
        message: step.description || 'Alert generated by Demo Engine',
        severity: 'medium',
        acknowledged: false
      }));
    }

    if (step.pulseDrop) {
      const pulsePromise = serviceClient
        .from('city_pulse')
        .select('*')
        .eq('city_id', cityId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data: currentPulse }) => {
          const oldScore = currentPulse?.score ?? 82;
          const newScore = Math.max(0, oldScore - step.pulseDrop);
          return serviceClient.from('city_pulse').insert({
            city_id: cityId,
            score: newScore,
            traffic_score: currentPulse?.traffic_score ?? 80,
            environment_score: currentPulse?.environment_score ?? 75,
            utilities_score: currentPulse?.utilities_score ?? 85,
            safety_score: currentPulse?.safety_score ?? 78,
            status: newScore < 60 ? 'warning' : 'stable'
          });
        });
      track('city_pulse', pulsePromise);
    }

    await Promise.all(inserts);

    if (errors.length > 0) {
      return jsonResponse({ success: false, errors }, 207);
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
