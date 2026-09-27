'use client';

import React from 'react';
import { RoomAvailability } from '@/types';
import { RoomCard } from './RoomCard';
import { MonitorOff } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { BUILDING_ORDER } from '@/data/rooms';

interface RoomListProps {
  availabilities: RoomAvailability[];
  currentHour?: number;
  onResetFilters?: () => void;
  lang?: Language;
}

export const RoomList: React.FC<RoomListProps> = ({
  availabilities,
  currentHour,
  onResetFilters,
  lang = 'sv',
}) => {
  const t = translations[lang];

  if (availabilities.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="panel max-w-md mx-auto p-6 flex flex-col items-center justify-center bg-[var(--panel-solid)]">
          <MonitorOff size={32} className="text-[var(--ink-3)] mb-2.5 opacity-60" />
          <h3 className="font-sans text-sm font-semibold text-[var(--ink)] mb-1">
            {t.noRoomsMatch}
          </h3>
          <p className="text-xs text-[var(--ink-3)] mb-3.5">
            {t.noRoomsMatchSub}
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="panel px-3.5 py-1.5 text-xs font-sans text-[var(--ink)] hover:bg-[var(--panel-hover)] border-[var(--rule)] cursor-pointer font-medium"
            >
              {t.resetFilters}
            </button>
          )}
        </div>
      </div>
    );
  }

  const freeRooms = availabilities.filter((a) => a.status !== 'BUSY');
  const busyRooms = availabilities.filter((a) => a.status === 'BUSY');

  // Group available rooms by building in BUILDING_ORDER
  const freeGroups: Array<{ building: string; rooms: RoomAvailability[] }> = BUILDING_ORDER.map((building) => ({
    building,
    rooms: freeRooms.filter((a) => a.room.building === building),
  })).filter((group) => group.rooms.length > 0);

  // Catch any room with an unlisted building to ensure no rooms are ever dropped
  const knownBuildings = new Set<string>(BUILDING_ORDER);
  const otherRooms = freeRooms.filter((a) => !knownBuildings.has(a.room.building));
  if (otherRooms.length > 0) {
    freeGroups.push({
      building: lang === 'en' ? 'Other' : 'Övrigt',
      rooms: otherRooms,
    });
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 pb-16 space-y-2">
      {/* Available / Free Rooms (Partitioned by building with divider headers) */}
      {freeGroups.map((group) => (
        <div key={group.building} className="space-y-1">
          <div className="py-2.5 flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" aria-hidden="true" />
            <h2 className="font-sans text-[11px] uppercase tracking-wider text-[var(--ink-3)] font-medium select-none m-0">
              {group.building}
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" aria-hidden="true" />
          </div>
          <div className="room-divider-list">
            {group.rooms.map((avail) => (
              <RoomCard key={avail.room.id} availability={avail} currentHour={currentHour} lang={lang} />
            ))}
          </div>
        </div>
      ))}

      {/* Center Divider Header: Upptagna salar: / Occupied labs: */}
      {freeRooms.length > 0 && busyRooms.length > 0 && (
        <div className="py-2.5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" aria-hidden="true" />
          <h2 className="font-sans text-[11px] uppercase tracking-wider text-[var(--ink-3)] font-medium select-none m-0">
            {t.occupiedHeader}
          </h2>
          <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" aria-hidden="true" />
        </div>
      )}

      {/* Occupied / Busy Rooms (Grouped by building sequence without extra divider lines) */}
      {busyRooms.length > 0 && (
        <div className="room-divider-list">
          {busyRooms.map((avail) => (
            <RoomCard key={avail.room.id} availability={avail} currentHour={currentHour} lang={lang} />
          ))}
        </div>
      )}
    </main>
  );
};
