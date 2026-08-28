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
 * Generate 08:00 to 20:00 Gantt timeline segments for a room on the target day.
 */
export function calculateGanttSegments(
  intervals: TimeSlotInterval[],
  targetDayDateStr: string
): GanttSegment[] {
  // Start of Gantt window: 08:00, End: 20:00
  const dayStartMs = parseStockholmDateTime(targetDayDateStr, '08:00');
  const dayEndMs = parseStockholmDateTime(targetDayDateStr, '20:00');

  // Filter intervals that overlap with 08:00 - 20:00 on this day
  const dayIntervals = intervals
    .filter((iv) => iv.start < dayEndMs && iv.end > dayStartMs)
    .map((iv) => ({
      start: Math.max(iv.start, dayStartMs),
      end: Math.min(iv.end, dayEndMs),
      courseCode: iv.courseCode,
    }))
    .sort((a, b) => a.start - b.start);

  const segments: GanttSegment[] = [];
  let currentMs = dayStartMs;

  const msToHour = (ms: number) => {
    const frac = (ms - dayStartMs) / (dayEndMs - dayStartMs);
    return 8 + frac * 12; // maps [0, 1] to [8, 20]
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
    // Trailing free block until 20:00
    segments.push({
      startHour: msToHour(currentMs),
      endHour: 20,
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
  const endOfDayMs = parseStockholmDateTime(targetDateStr, '23:59');

  // 1. Check if currently inside any reservation
  const activeBooking = intervals.find((iv) => iv.start <= targetTimeMs && targetTimeMs < iv.end);

  const ganttSegments = calculateGanttSegments(intervals, targetDateStr);

  if (activeBooking) {
    // Room is BUSY
    return {
      room,
      status: 'BUSY',
      busyUntil: activeBooking.end,
      currentBooking: {
        courseCode: activeBooking.courseCode,
        info: activeBooking.info,
        end: activeBooking.end,
      },
      ganttSegments,
    };
  }

  // 2. Room is currently NOT busy (either FREE or ENDING_SOON)
  // Find the next upcoming reservation today
  const upcomingToday = intervals.find(
    (iv) => iv.start > targetTimeMs && iv.start <= endOfDayMs
  );

  if (upcomingToday) {
    const freeMinutesRemaining = Math.max(
      0,
      Math.floor((upcomingToday.start - targetTimeMs) / 60000)
    );
    const status = freeMinutesRemaining < 30 ? 'ENDING_SOON' : 'FREE';

    return {
      room,
      status,
      freeUntil: upcomingToday.start,
      freeMinutesRemaining,
      nextBooking: {
        courseCode: upcomingToday.courseCode,
        info: upcomingToday.info,
        start: upcomingToday.start,
      },
      ganttSegments,
    };
  }

  // 3. No upcoming reservations for the rest of the day
  return {
    room,
    status: 'FREE',
    freeUntil: undefined,
    freeMinutesRemaining: undefined, // Free rest of day
    ganttSegments,
  };
}

/**
 * Calculate availability for all 42 rooms given schedule data
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
