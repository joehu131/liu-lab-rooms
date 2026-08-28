import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

async function loadWidgetEngine() {
  const code = fs.readFileSync('scripts/liu-lab-widget.js', 'utf8');
  const sandbox: {
    module: { exports: Record<string, unknown> };
    exports: Record<string, unknown>;
    console: Console;
  } = {
    module: { exports: {} },
    exports: {},
    console,
  };
  vm.createContext(sandbox);
  await vm.runInContext(`(async () => {\n${code}\n})()`, sandbox);
  return sandbox.module.exports;
}

test('Widget Engine - Catalog Integrity & Logic', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetEngine: any = await loadWidgetEngine();
  const { LAB_CATALOG, evaluateRoomAvailability, getSortedRooms, parseStockholmDateTime, formatRemaining } = widgetEngine;

  // 1. Catalog Integrity
  assert.equal(LAB_CATALOG.length, 42, 'Widget catalog should contain 42 rooms');
  const linuxRooms = LAB_CATALOG.filter((r: { os: string }) => r.os === 'linux');
  const windowsRooms = LAB_CATALOG.filter((r: { os: string }) => r.os === 'windows');
  assert.equal(linuxRooms.length, 22, 'Should have 22 Linux rooms');
  assert.equal(windowsRooms.length, 20, 'Should have 20 Windows rooms');

  for (const r of LAB_CATALOG) {
    assert.ok(r.computers > 0, `Room ${r.name} must have computers count > 0`);
    assert.ok(r.building, `Room ${r.name} must have a building`);
    assert.ok(r.floor, `Room ${r.name} must have a floor`);
  }

  // 2. Availability Evaluation
  const testRoom = { id: '264540', name: 'SU00', os: 'linux', computers: 10 };
  const mockReservations = [
    {
      startdate: '2026-08-28',
      starttime: '10:15',
      enddate: '2026-08-28',
      endtime: '12:00',
      columns: ['', '', 'SU00, SU01'],
    },
    {
      startdate: '2026-08-28',
      starttime: '13:15',
      enddate: '2026-08-28',
      endtime: '15:00',
      columns: ['', '', 'SU00'],
    },
  ];

  // At 09:00 -> Free, but booking at 10:15 (diff: 75m -> ENDING_SOON)
  const t0900 = parseStockholmDateTime('2026-08-28', '09:00');
  const avail0900 = evaluateRoomAvailability(testRoom, mockReservations, t0900);
  assert.equal(avail0900.isFree, true);
  assert.equal(avail0900.status, 'ENDING_SOON');
  assert.equal(avail0900.freeMinutesRemaining, 75);

  // At 10:30 -> Busy until 12:00
  const t1030 = parseStockholmDateTime('2026-08-28', '10:30');
  const avail1030 = evaluateRoomAvailability(testRoom, mockReservations, t1030);
  assert.equal(avail1030.isFree, false);
  assert.equal(avail1030.status, 'BUSY');

  // At 16:00 -> Free All Day
  const t1600 = parseStockholmDateTime('2026-08-28', '16:00');
  const avail1600 = evaluateRoomAvailability(testRoom, mockReservations, t1600);
  assert.equal(avail1600.isFree, true);
  assert.equal(avail1600.status, 'FREE');

  // 3. Format Remaining Time
  assert.equal(formatRemaining(20), '20m');
  assert.equal(formatRemaining(60), '1h');
  assert.equal(formatRemaining(85), '1.4h');
  assert.equal(formatRemaining(150), '2.5h');

  // 4. Prioritization: >= 10 pcs A-Z -> < 10 pcs A-Z -> Booked A-Z
  const mockSchedule = {
    reservations: [
      {
        startdate: '2026-08-28',
        starttime: '08:00',
        enddate: '2026-08-28',
        endtime: '20:00',
        columns: ['', '', 'Asgård'],
      },
    ],
  };

  const evalTime = parseStockholmDateTime('2026-08-28', '09:00');
  const sorted = getSortedRooms(mockSchedule, evalTime);

  // Alfheim (Windows, 43 pcs, free) should be first
  assert.equal(sorted[0].room.name, 'Alfheim');
  assert.equal(sorted[0].isFree, true);

  // Asgård is booked -> should be at the bottom among booked rooms
  const asgard = sorted.find((r: { room: { name: string } }) => r.room.name === 'Asgård');
  assert.equal(asgard.status, 'BUSY');

  // F302 (< 10 pcs) should be placed after >= 10 pcs free rooms
  const f302Idx = sorted.findIndex((r: { room: { name: string } }) => r.room.name === 'F302');
  const alfheimIdx = sorted.findIndex((r: { room: { name: string } }) => r.room.name === 'Alfheim');
  assert.ok(alfheimIdx < f302Idx, 'Alfheim (>=10 pcs) must come before F302 (<10 pcs)');
});
