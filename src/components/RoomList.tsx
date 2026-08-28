'use client';

import React from 'react';
import { RoomAvailability } from '@/types';
import { RoomCard } from './RoomCard';
import { MonitorOff } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

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
          <h3 className="font-mono text-sm font-semibold text-[var(--ink)] mb-1">
            {t.noRoomsMatch}
          </h3>
          <p className="text-xs text-[var(--ink-3)] mb-3.5">
            {t.noRoomsMatchSub}
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="panel px-3.5 py-1.5 text-xs font-mono text-[var(--ink)] hover:bg-[var(--panel-hover)] border-[var(--rule)] cursor-pointer"
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

  return (
    <main className="w-full max-w-5xl mx-auto px-4 pb-16 space-y-1">
      {/* Available / Free Rooms */}
      {freeRooms.length > 0 && (
        <div className="room-divider-list">
          {freeRooms.map((avail) => (
            <RoomCard key={avail.room.id} availability={avail} currentHour={currentHour} lang={lang} />
          ))}
        </div>
      )}

      {/* Center Divider Header: Upptagna salar: / Occupied labs: */}
      {freeRooms.length > 0 && busyRooms.length > 0 && (
        <div className="py-2.5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" />
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--ink-3)] font-medium select-none">
            {t.occupiedHeader}
          </span>
          <div className="flex-1 h-[1px] bg-[var(--rule-faint)]" />
        </div>
      )}

      {/* Occupied / Busy Rooms */}
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
