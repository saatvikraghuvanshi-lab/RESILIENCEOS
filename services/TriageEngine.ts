
import { Severity, IncidentCategory } from '../types';

/**
 * Automated Triage Engine
 * Prioritizes signals based on keyword analysis and simulated vision categorization.
 */

const KEYWORDS = {
  CRITICAL: ['trapped', 'unconscious', 'bleeding', 'rising', 'chest pain', 'baby'],
  HIGH: ['smoke', 'stuck', 'flood', 'elderly', 'fire'],
};

export const categorizeIncident = (message: string): IncidentCategory => {
  const text = message.toLowerCase();
  if (text.includes('flood') || text.includes('water')) return 'Flood';
  if (text.includes('fire') || text.includes('smoke')) return 'Fire';
  if (text.includes('collapse') || text.includes('trapped')) return 'Structural';
  if (text.includes('medical') || text.includes('unconscious') || text.includes('doctor')) return 'Medical';
  return 'General';
};

export const calculatePriority = (message: string, userSeverity: number): Severity => {
  const text = message.toLowerCase();
  let score = userSeverity;

  if (KEYWORDS.CRITICAL.some(k => text.includes(k))) score += 2;
  else if (KEYWORDS.HIGH.some(k => text.includes(k))) score += 1;

  return Math.min(Math.max(score, 1), 5) as Severity;
};
