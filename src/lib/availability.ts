import { LAB_ROOMS } from '@/data/rooms';
import {
  GanttSegment,
  RoomAvailability,
  RoomMetadata,
  ScheduleResponse,
  TimeSlotInterval,
} from '@/types';
import { parseStockholmDateTime } from './timeedit';
import { formatStockholmDate } from './formatters';

/**
 * Generate 07:00 to 21:00 Gantt timeline segments for a room on the target day.
 */
export function calculateGanttSegments(
  intervals: TimeSlotInterval[],
  targetDayDateStr: string
): GanttSegment[] {
  // Start of Gantt window: 07:00, End: 21:00
  const dayStartMs = parseStockholmDateTime(targetDayDateStr, '07:00');
  const dayEndMs = parseStockholmDateTime(targetDayDateStr, '21:00');

  // Filter intervals that overlap with 07:00 - 21:00 on this day
  const dayIntervalsRaw = intervals
    .filter((iv) => iv.start < dayEndMs && iv.end > dayStartMs)
    .map((iv) => ({
      start: Math.max(iv.start, dayStartMs),
      end: Math.min(iv.end, dayEndMs),
      courseCode: iv.courseCode,
    }))
    .sort((a, b) => a.start - b.start);

  // Flatten overlapping/contiguous intervals into distinct non-overlapping occupied spans
  const dayIntervals: Array<{ start: number; end: number; courseCode?: string }> = [];
  for (const iv of dayIntervalsRaw) {
    if (dayIntervals.length === 0) {
      dayIntervals.push({ ...iv });
      continue;
    }
    const prev = dayIntervals[dayIntervals.length - 1];
    if (iv.start <= prev.end) {
      prev.end = Math.max(prev.end, iv.end);
      if (!prev.courseCode && iv.courseCode) {
        prev.courseCode = iv.courseCode;
      }
    } else {
      dayIntervals.push({ ...iv });
    }
  }

  const segments: GanttSegment[] = [];
  let currentMs = dayStartMs;

  const msToHour = (ms: number) => {
    const frac = (ms - dayStartMs) / (dayEndMs - dayStartMs);
    return 7 + frac * 14; // maps [0, 1] to [7, 21]
  };

  for (const iv of dayIntervals) {
    if (iv.start > currentMs) {
      // Free gap
      segments.push({
        startHour: msToHour(currentMs),
        endHour: msToHour(iv.start),
        isOccupied: false,
      });
    }

    // Busy block
    segments.push({
      startHour: msToHour(iv.start),
      endHour: msToHour(iv.end),
      isOccupied: true,
      courseCode: iv.courseCode,
    });

    currentMs = Math.max(currentMs, iv.end);
  }

  if (currentMs < dayEndMs) {
    // Trailing free block until 21:00
    segments.push({
      startHour: msToHour(currentMs),
      endHour: 21,
      isOccupied: false,
    });
  }

  return segments;
}

/**
 * Calculate availability state of a single room at a target timestamp
 */
export function calculateRoomAvailability(
  room: RoomMetadata,
  intervals: TimeSlotInterval[],
  targetTimeMs: number
): RoomAvailability {
  const targetDateStr = formatStockholmDate(targetTimeMs);
  const startOfDayMs = parseStockholmDateTime(targetDateStr, '00:00');
  const endOfDayMs = parseStockholmDateTime(targetDateStr, '23:59');

  // Today's all bookings for this room
  const todayBookings = intervals
    .filter((iv) => iv.start < endOfDayMs && iv.end > startOfDayMs)
    .sort((a, b) => a.start - b.start);

  // 1. Check if currently inside any reservation
  const activeBooking = intervals.find((iv) => iv.start <= targetTimeMs && targetTimeMs < iv.end);

  const ganttSegments = calculateGanttSegments(intervals, targetDateStr);

  if (activeBooking) {
    // Chain contiguous or overlapping future bookings to find true effective end time
    let effectiveEnd = activeBooking.end;
    let chained = true;
    while (chained) {
      chained = false;
      for (const iv of intervals) {
        if (iv.start <= effectiveEnd && iv.end > effectiveEnd) {
          effectiveEnd = iv.end;
          chained = true;
        }
      }
    }

    return {
      room,
      status: 'BUSY',
      busyUntil: effectiveEnd,
      currentBooking: {
        courseCode: activeBooking.courseCode,
        activityType: activeBooking.activityType,
        info: activeBooking.info,
        end: effectiveEnd,
      },
      ganttSegments,
      todayBookings,
    };
  }

  // 2. Room is currently FREE - Find next upcoming booking today (after targetTime)
  const futureToday = todayBookings.filter((iv) => iv.start > targetTimeMs);

  if (futureToday.length === 0) {
    // Free for the rest of today
    return {
      room,
      status: 'FREE',
      ganttSegments,
      todayBookings,
    };
  }

  // Next booking starts today
  const next = futureToday[0];
  const diffMinutes = Math.max(0, Math.floor((next.start - targetTimeMs) / 60000));

  // If less than 30 minutes remaining, status is ENDING_SOON
  const status = diffMinutes < 30 ? 'ENDING_SOON' : 'FREE';

  return {
    room,
    status,
    freeUntil: next.start,
    freeMinutesRemaining: diffMinutes,
    nextBooking: {
      courseCode: next.courseCode,
      activityType: next.activityType,
      info: next.info,
      start: next.start,
    },
    ganttSegments,
    todayBookings,
  };
}

/**
 * Calculate availability for all 42 lab rooms
 */
export function calculateAllRoomsAvailability(
  schedule: ScheduleResponse | null,
  targetTimeMs: number
): RoomAvailability[] {
  const reservations = schedule?.reservations || {};

  return LAB_ROOMS.map((room) => {
    const intervals = reservations[room.name] || [];
    return calculateRoomAvailability(room, intervals, targetTimeMs);
  });
}
