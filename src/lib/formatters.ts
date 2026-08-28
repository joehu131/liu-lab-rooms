import { Language } from './i18n';

/**
 * Format a duration in minutes into a clean human string, e.g. "2h 45m", "30m", "< 1m"
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Format epoch ms timestamp to "HH:MM" in Europe/Stockholm timezone
 */
export function formatStockholmTime(epochMs: number): string {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date(epochMs));
}

/**
 * Format epoch ms timestamp to "YYYY-MM-DD" in Europe/Stockholm timezone
 */
export function formatStockholmDate(epochMs: number): string {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date(epochMs));
}

/**
 * Format date to weekday short name in Swedish or English, e.g. "Idag", "Imorgon", "Mån", "Tis", etc.
 */
export function formatWeekdayLabel(
  epochMs: number,
  referenceMs: number = Date.now(),
  lang: Language = 'sv'
): string {
  const refDateStr = formatStockholmDate(referenceMs);
  const targetDateStr = formatStockholmDate(epochMs);

  const tomorrowMs = referenceMs + 24 * 60 * 60 * 1000;
  const tomorrowDateStr = formatStockholmDate(tomorrowMs);

  if (targetDateStr === refDateStr) return lang === 'en' ? 'Today' : 'Idag';
  if (targetDateStr === tomorrowDateStr) return lang === 'en' ? 'Tomorrow' : 'Imorgon';

  const locale = lang === 'en' ? 'en-US' : 'sv-SE';
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Stockholm',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
  return formatter.format(new Date(epochMs));
}
