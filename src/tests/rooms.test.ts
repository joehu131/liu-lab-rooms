import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_ROOMS, ALL_BUILDINGS, ALL_TIMEEDIT_IDS } from '../data/rooms';

test('LAB_ROOMS catalog integrity', async (t) => {
  await t.test('has exactly 42 rooms', () => {
    assert.equal(LAB_ROOMS.length, 42);
  });

  await t.test('has 22 Linux rooms and 20 Windows rooms', () => {
    const linuxRooms = LAB_ROOMS.filter((r) => r.os === 'linux');
    const winRooms = LAB_ROOMS.filter((r) => r.os === 'windows');
    assert.equal(linuxRooms.length, 22);
    assert.equal(winRooms.length, 20);
  });

  await t.test('SU15/16 and SU17/18 exist as single rooms with 24 computers and 48 seats', () => {
    const su1516 = LAB_ROOMS.find((r) => r.name === 'SU15/16');
    const su1718 = LAB_ROOMS.find((r) => r.name === 'SU17/18');

    assert.ok(su1516, 'SU15/16 should exist');
    assert.equal(su1516?.seats, 48);
    assert.equal(su1516?.computers, 24);
    assert.equal(su1516?.building, 'B-huset');

    assert.ok(su1718, 'SU17/18 should exist');
    assert.equal(su1718?.seats, 48);
    assert.equal(su1718?.computers, 24);
    assert.equal(su1718?.building, 'B-huset');
  });

  await t.test('all room IDs and TimeEdit IDs are unique', () => {
    const ids = new Set<string>();
    const timeeditIds = new Set<string>();
    const names = new Set<string>();

    for (const room of LAB_ROOMS) {
      assert.ok(!ids.has(room.id), `Duplicate room id: ${room.id}`);
      assert.ok(!timeeditIds.has(room.timeeditId), `Duplicate timeeditId: ${room.timeeditId}`);
      assert.ok(!names.has(room.name), `Duplicate room name: ${room.name}`);

      ids.add(room.id);
      timeeditIds.add(room.timeeditId);
      names.add(room.name);
    }
  });

  await t.test('all rooms have valid Mazemap URLs and valid buildings', () => {
    const validBuildings = ALL_BUILDINGS.filter((b) => b !== 'All');

    for (const room of LAB_ROOMS) {
      assert.ok(
        room.mazemapUrl.startsWith('https://use.mazemap.com/?utm_medium=longurl#v=1&campusid=742'),
        `Invalid Mazemap URL for ${room.name}: ${room.mazemapUrl}`
      );
      assert.ok(
        validBuildings.includes(room.building as any),
        `Invalid building for ${room.name}: ${room.building}`
      );
      assert.ok(room.seats > 0, `Seats should be > 0 for ${room.name}`);
      assert.ok(room.computers > 0, `Computers should be > 0 for ${room.name}`);
    }
  });

  await t.test('ALL_TIMEEDIT_IDS contains 42 IDs', () => {
    assert.equal(ALL_TIMEEDIT_IDS.length, 42);
  });
});
