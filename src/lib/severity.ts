import { SeverityType } from '../types/database';

/**
 * The database standardizes every severity column on
 * ('low' | 'medium' | 'high' | 'critical'). The alert UI (AlertItem)
 * displays a 3-tier badge ('info' | 'warning' | 'critical'). This is
 * the single place that maps between the two, so the mapping can't
 * drift between the initial fetch and the realtime insert handler.
 */
export function dbSeverityToAlertUi(severity: SeverityType | string): 'critical' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'info';
  }
}

/** Inverse of dbSeverityToAlertUi, for inserting UI-shaped alert data
 * (e.g. demo scenario steps) into the DB's 4-tier severity column. */
export function alertUiSeverityToDb(severity: 'critical' | 'warning' | 'info' | string): SeverityType {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'warning':
      return 'high';
    case 'info':
    default:
      return 'low';
  }
}
