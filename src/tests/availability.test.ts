import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_ROOMS } from '../data/rooms';
import {
  parseStockholmDateTime,
  parseTimeEditResponse,
} from '../lib/timeedit';
import {
  calculateRoomAvailability,
  calculateGanttSegments,
  calculateAllRoomsAvailability,
} from '../lib/availability';
import {
  formatMinutes,
  formatStockholmTime,
  formatStockholmDate,
  formatWeekdayLabel,
} from '../lib/formatters';
import { TimeSlotInterval } from '../types';

test('Availability Engine & Timezone Tests', async (t) => {
  const asgard = LAB_ROOMS.find((r) => r.name === 'Asgård')!;
  const su00 = LAB_ROOMS.find((r) => r.name === 'SU00')!;
  const su1516 = LAB_ROOMS.find((r) => r.name === 'SU15/16')!;

  await t.test('parseStockholmDateTime correctly converts CET/CEST', () => {
    // Summer (CEST = UTC+2)
    const summerEpoch = parseStockholmDateTime('2026-08-28', '10:15');
    const summerDate = new Date(summerEpoch);
    assert.equal(summerDate.getUTCHours(), 8);
    assert.equal(summerDate.getUTCMinutes(), 15);

    // Winter (CET = UTC+1)
    const winterEpoch = parseStockholmDateTime('2026-12-15', '10:15');
    const winterDate = new Date(winterEpoch);
    assert.equal(winterDate.getUTCHours(), 9);
    assert.equal(winterDate.getUTCMinutes(), 15);
  });

  await t.test('calculateRoomAvailability handles ongoing, ending soon, and free states', () => {
    const intervals: TimeSlotInterval[] = [
      {
        start: parseStockholmDateTime('2026-08-28', '08:15'),
        end: parseStockholmDateTime('2026-08-28', '10:00'),
        courseCode: 'TDDD27',
      },
      {
        start: parseStockholmDateTime('2026-08-28', '10:15'),
        end: parseStockholmDateTime('2026-08-28', '12:00'),
        courseCode: 'TDDC76',
      },
      {
        start: parseStockholmDateTime('2026-08-28', '13:15'),
        end: parseStockholmDateTime('2026-08-28', '17:00'),
        courseCode: 'TDDE01',
      },
    ];

    // Case 1: During pass 1 (09:00) -> BUSY until 10:00
    const t1 = parseStockholmDateTime('2026-08-28', '09:00');
    const res1 = calculateRoomAvailability(asgard, intervals, t1);
    assert.equal(res1.status, 'BUSY');
    assert.equal(res1.busyUntil, intervals[0].end);
    assert.equal(res1.currentBooking?.courseCode, 'TDDD27');

    // Case 2: During break (10:05) -> only 10m until 10:15 pass -> ENDING_SOON (amber)
    const t2 = parseStockholmDateTime('2026-08-28', '10:05');
    const res2 = calculateRoomAvailability(asgard, intervals, t2);
    assert.equal(res2.status, 'ENDING_SOON');
    assert.equal(res2.freeMinutesRemaining, 10);
    assert.equal(res2.nextBooking?.courseCode, 'TDDC76');

    // Case 3: During lunch (12:00) -> 75m until 13:15 pass -> FREE (green)
    const t3 = parseStockholmDateTime('2026-08-28', '12:00');
    const res3 = calculateRoomAvailability(asgard, intervals, t3);
    assert.equal(res3.status, 'FREE');
    assert.equal(res3.freeMinutesRemaining, 75);
    assert.equal(res3.freeUntil, intervals[2].start);
    assert.equal(res3.nextBooking?.courseCode, 'TDDE01');

    // Case 4: Evening after 17:00 (17:30) -> FREE with no more bookings today
    const t4 = parseStockholmDateTime('2026-08-28', '17:30');
    const res4 = calculateRoomAvailability(asgard, intervals, t4);
    assert.equal(res4.status, 'FREE');
    assert.equal(res4.freeUntil, undefined);
    assert.equal(res4.freeMinutesRemaining, undefined);
  });

  await t.test('parseTimeEditResponse correctly handles raw TimeEdit structures', () => {
    const raw = {
      columnheaders: ['Kurs', 'Undervisningstyp', 'Lokal', 'Information till student', 'Status'],
      reservations: [
        {
          id: '1001',
          startdate: '2026-08-28',
          starttime: '08:15',
          enddate: '2026-08-28',
          endtime: '10:00',
          columns: ['TDDD27', 'Laboration', 'Asgård, Egypten', 'Lab 1', 'Bokad'],
        },
        {
          id: '1002',
          startdate: '2026-08-28',
          starttime: '10:15',
          enddate: '2026-08-28',
          endtime: '12:00',
          columns: ['TDDD38', 'Laboration', 'SU15/16', 'Lab 2', 'Inställd'], // Cancelled event
        },
        {
          id: '1003',
          startdate: '2026-08-28',
          starttime: '13:15',
          enddate: '2026-08-28',
          endtime: '17:00',
          columns: ['TDDC76', 'Laboration', 'SU15/16', 'Lab 3', 'Bokad'],
        },
      ],
    };

    const parsed = parseTimeEditResponse(raw);

    // Asgård should have 1 booking
    assert.equal(parsed.reservations['Asgård']?.length, 1);
    assert.equal(parsed.reservations['Asgård'][0].courseCode, 'TDDD27');

    // Egypten should also have 1 booking (from comma separation)
    assert.equal(parsed.reservations['Egypten']?.length, 1);

    // SU15/16 should have 1 booking (since the 10:15 one was Inställd)
    assert.equal(parsed.reservations['SU15/16']?.length, 1);
    assert.equal(parsed.reservations['SU15/16'][0].courseCode, 'TDDC76');
  });

  await t.test('calculateGanttSegments produces accurate 08:00 to 20:00 blocks', () => {
    const intervals: TimeSlotInterval[] = [
      {
        start: parseStockholmDateTime('2026-08-28', '08:15'),
        end: parseStockholmDateTime('2026-08-28', '10:00'),
        courseCode: 'TDDD27',
      },
    ];

    const segments = calculateGanttSegments(intervals, '2026-08-28');
    assert.ok(segments.length >= 3);

    // Segment 1: Free 08:00 - 08:15 (8.0 to 8.25)
    assert.equal(segments[0].isOccupied, false);
    assert.equal(segments[0].startHour, 8);
    assert.equal(segments[0].endHour, 8.25);

    // Segment 2: Occupied 08:15 - 10:00 (8.25 to 10.0)
    assert.equal(segments[1].isOccupied, true);
    assert.equal(segments[1].startHour, 8.25);
    assert.equal(segments[1].endHour, 10);
    assert.equal(segments[1].courseCode, 'TDDD27');

    // Segment 3: Free 10:00 - 20:00 (10.0 to 20.0)
    assert.equal(segments[2].isOccupied, false);
    assert.equal(segments[2].startHour, 10);
    assert.equal(segments[2].endHour, 20);
  });

  await t.test('Formatters test', () => {
    assert.equal(formatMinutes(0), '0m');
    assert.equal(formatMinutes(25), '25m');
    assert.equal(formatMinutes(60), '1h');
    assert.equal(formatMinutes(135), '2h 15m');

    const epoch = parseStockholmDateTime('2026-08-28', '13:15');
    assert.equal(formatStockholmTime(epoch), '13:15');
    assert.equal(formatStockholmDate(epoch), '2026-08-28');
  });
});
