import { ALL_TIMEEDIT_IDS, LAB_ROOMS } from '@/data/rooms';
import { ScheduleResponse, TimeSlotInterval } from '@/types';

/**
 * Deterministically parse a date and time string in Swedish local time (Europe/Stockholm)
 * into UTC epoch milliseconds.
 */
export function parseStockholmDateTime(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const approxUtc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(approxUtc));
  let sHour = 0;
  let sMinute = 0;
  let sDay = 0;
  let sMonth = 0;
  let sYear = 0;

  for (const part of parts) {
    if (part.type === 'hour') sHour = Number(part.value) % 24;
    if (part.type === 'minute') sMinute = Number(part.value);
    if (part.type === 'day') sDay = Number(part.value);
    if (part.type === 'month') sMonth = Number(part.value);
    if (part.type === 'year') sYear = Number(part.value);
  }

  const stockholmMs = Date.UTC(sYear, sMonth - 1, sDay, sHour, sMinute);
  const offsetMs = stockholmMs - approxUtc;
  return approxUtc - offsetMs;
}

interface TimeEditRawResponse {
  columnheaders?: string[];
  info?: {
    reservationlimit?: number;
    reservationcount?: number;
  };
  reservations?: Array<{
    id: string;
    startdate: string;
    starttime: string;
    enddate: string;
    endtime: string;
    columns: string[];
  }>;
}

/**
 * Normalize and parse raw TimeEdit JSON response into structured room intervals
 */
export function parseTimeEditResponse(raw: TimeEditRawResponse): ScheduleResponse {
  const now = Date.now();
  const validFrom = now;
  const validTo = now + 14 * 24 * 60 * 60 * 1000; // 14 days

  const headers = raw.columnheaders || [];
  const lokalIdx = headers.indexOf('Lokal');
  const courseIdx = headers.indexOf('Kurs');
  const undervisningstypIdx = headers.indexOf('Undervisningstyp');
  const infoIdx = headers.indexOf('Information till student');
  const statusIdx = headers.indexOf('Status');

  const roomNamesSet = new Set(LAB_ROOMS.map((r) => r.name));
  const reservationsByRoom: Record<string, TimeSlotInterval[]> = {};

  for (const room of LAB_ROOMS) {
    reservationsByRoom[room.name] = [];
  }

  const reservations = raw.reservations || [];

  for (const res of reservations) {
    // Check if status is cancelled
    if (statusIdx !== -1 && res.columns[statusIdx]?.toLowerCase().includes('inställd')) {
      continue;
    }

    const lokalRaw = lokalIdx !== -1 ? res.columns[lokalIdx] || '' : '';
    if (!lokalRaw) continue;

    const startMs = parseStockholmDateTime(res.startdate, res.starttime);
    const endMs = parseStockholmDateTime(res.enddate, res.endtime);

    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
      continue;
    }

    const courseCode = courseIdx !== -1 && res.columns[courseIdx]?.trim() ? res.columns[courseIdx].trim() : undefined;
    const activityType = undervisningstypIdx !== -1 && res.columns[undervisningstypIdx]?.trim() ? res.columns[undervisningstypIdx].trim() : undefined;
    const info = infoIdx !== -1 && res.columns[infoIdx]?.trim() ? res.columns[infoIdx].trim() : undefined;

    // Split rooms by comma or newline (e.g. "Asgård, Egypten" or "SU01, SU02")
    const reservedRooms = lokalRaw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const r of reservedRooms) {
      if (roomNamesSet.has(r)) {
        reservationsByRoom[r].push({
          start: startMs,
          end: endMs,
          courseCode: courseCode || undefined,
          activityType: activityType || undefined,
          info: info || undefined,
        });
      }
    }
  }

  // Sort and deduplicate intervals for each room
  for (const roomName of Object.keys(reservationsByRoom)) {
    const list = reservationsByRoom[roomName];
    list.sort((a, b) => a.start - b.start);

    // Only merge identical events
    const merged: TimeSlotInterval[] = [];
    for (const current of list) {
      if (merged.length === 0) {
        merged.push(current);
        continue;
      }

      const prev = merged[merged.length - 1];
      const isSameEvent =
        prev.courseCode === current.courseCode &&
        prev.activityType === current.activityType &&
        prev.info === current.info;

      if (isSameEvent && current.start <= prev.end) {
        prev.end = Math.max(prev.end, current.end);
      } else {
        merged.push(current);
      }
    }

    reservationsByRoom[roomName] = merged;
  }

  return {
    fetchedAt: now,
    validFrom,
    validTo,
    reservations: reservationsByRoom,
  };
}

/**
 * Fetch schedule from TimeEdit API
 */
export async function fetchTimeEditSchedule(daysAhead: number = 14): Promise<ScheduleResponse> {
  const objsStr = ALL_TIMEEDIT_IDS.join(',');
  const url = `https://cloud.timeedit.net/liu/web/schema/ri.json?sid=3&p=0.d,${daysAhead}.d&objects=${objsStr}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
    signal: AbortSignal.timeout(8000),
    // revalidate every 15 minutes
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    throw new Error(`TimeEdit API returned status ${res.status}: ${res.statusText}`);
  }

  const data: TimeEditRawResponse = await res.json();
  return parseTimeEditResponse(data);
}
