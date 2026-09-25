import { SignalType } from '../types/citypulse';
import { EventType } from '../types/database';

/**
 * civic_events.type is a DB CHECK constraint limited to
 * ('traffic' | 'air_quality' | 'weather' | 'transit' | 'incident' | 'utility').
 * The UI-facing SignalType union is broader ('airQuality', 'incidents',
 * 'utilities', 'water', 'noise', ...) because it also drives icons/labels.
 * This is the single translation point used whenever a UI-shaped demo
 * step or map incident gets written to civic_events, so the two unions
 * are free to diverge without insert failures.
 */
export function signalTypeToDbEventType(type: SignalType | string): EventType {
  switch (type) {
    case 'traffic':
      return 'traffic';
    case 'airQuality':
    case 'air_quality':
      return 'air_quality';
    case 'weather':
      return 'weather';
    case 'transit':
      return 'transit';
    case 'incidents':
    case 'incident':
    case 'noise':
      return 'incident';
    case 'utilities':
    case 'utility':
    case 'water':
      return 'utility';
    default:
      return 'incident';
  }
}
