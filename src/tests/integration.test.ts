import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_ROOMS } from '../data/rooms';
import { parseStockholmDateTime } from '../lib/timeedit';
import { calculateAllRoomsAvailability, calculateRoomAvailability } from '../lib/availability';
import { ScheduleResponse } from '../types';

test('Integration & Time Machine Simulation Tests', async (t) => {
  const mockSchedule: ScheduleResponse = {
    fetchedAt: Date.now(),
    validFrom: Date.now(),
    validTo: Date.now() + 14 * 24 * 60 * 60 * 1000,
    reservations: {
      Asgård: [
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
          start: parseStockholmDateTime('2026-08-29', '13:15'),
          end: parseStockholmDateTime('2026-08-29', '17:00'),
          courseCode: 'TDDD38',
        },
      ],
      'SU15/16': [
        {
          start: parseStockholmDateTime('2026-08-28', '13:15'),
          end: parseStockholmDateTime('2026-08-28', '17:00'),
          courseCode: 'TDDE01',
        },
      ],
    },
  };

  await t.test('All 42 rooms are evaluated in calculateAllRoomsAvailability', () => {
    const targetMs = parseStockholmDateTime('2026-08-28', '09:00');
    const availabilities = calculateAllRoomsAvailability(mockSchedule, targetMs);

    assert.equal(availabilities.length, 42);

    const asgard = availabilities.find((a) => a.room.name === 'Asgård')!;
    assert.equal(asgard.status, 'BUSY');
    assert.equal(asgard.currentBooking?.courseCode, 'TDDD27');

    const su00 = availabilities.find((a) => a.room.name === 'SU00')!;
    assert.equal(su00.status, 'FREE');
  });

  await t.test('Time Machine simulation into tomorrow evaluates tomorrow bookings correctly', () => {
    // Tomorrow at 14:00 -> Asgård has TDDD38 13:15-17:00 -> should be BUSY
    const tomorrowMs = parseStockholmDateTime('2026-08-29', '14:00');
    const availabilities = calculateAllRoomsAvailability(mockSchedule, tomorrowMs);

    const asgard = availabilities.find((a) => a.room.name === 'Asgård')!;
    assert.equal(asgard.status, 'BUSY');
    assert.equal(asgard.currentBooking?.courseCode, 'TDDD38');

    // SU15/16 has no bookings tomorrow -> should be FREE
    const su1516 = availabilities.find((a) => a.room.name === 'SU15/16')!;
    assert.equal(su1516.status, 'FREE');
  });

  await t.test('Filter simulation works across OS and Buildings', () => {
    const targetMs = parseStockholmDateTime('2026-08-28', '11:00');
    const availabilities = calculateAllRoomsAvailability(mockSchedule, targetMs);

    const linuxRooms = availabilities.filter((a) => a.room.os === 'linux');
    const winRooms = availabilities.filter((a) => a.room.os === 'windows');
    const bHusetRooms = availabilities.filter((a) => a.room.building === 'B-huset');

    assert.equal(linuxRooms.length, 22);
    assert.equal(winRooms.length, 20);
    assert.equal(bHusetRooms.length, 23); // 22 Linux + 1 Windows (Franklin) in B-huset
  });
});
