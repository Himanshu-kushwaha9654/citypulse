import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CityPulseRealtimeSubscriptions {
  metricsChannel?: RealtimeChannel;
  eventsChannel?: RealtimeChannel;
  anomaliesChannel?: RealtimeChannel;
  correlationsChannel?: RealtimeChannel;
  alertsChannel?: RealtimeChannel;
  pulseChannel?: RealtimeChannel;
  insightsChannel?: RealtimeChannel;
}

export function subscribeToCityRealtime(
  cityId: string,
  callbacks: {
    onMetricInsert?: (payload: any) => void;
    onEventInsert?: (payload: any) => void;
    onAnomalyInsert?: (payload: any) => void;
    onCorrelationInsert?: (payload: any) => void;
    onAlertInsert?: (payload: any) => void;
    onPulseUpdate?: (payload: any) => void;
    onInsightInsert?: (payload: any) => void;
  }
): CityPulseRealtimeSubscriptions {
  if (!isSupabaseConfigured()) return {};

  const channel = supabase
    .channel(`city-realtime-${cityId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'metrics', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onMetricInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'civic_events', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onEventInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'anomalies', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onAnomalyInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'correlations', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onCorrelationInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerts', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onAlertInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'city_pulse', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onPulseUpdate?.(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'insights', filter: `city_id=eq.${cityId}` },
      (payload) => callbacks.onInsightInsert?.(payload.new)
    )
    .subscribe();

  return { metricsChannel: channel };
}

export function unsubscribeRealtime(subscriptions: CityPulseRealtimeSubscriptions) {
  if (subscriptions.metricsChannel) {
    supabase.removeChannel(subscriptions.metricsChannel);
  }
}
