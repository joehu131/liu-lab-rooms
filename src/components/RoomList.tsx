'use client';

import React from 'react';
import { RoomAvailability } from '@/types';
import { RoomCard } from './RoomCard';
import { MonitorOff } from 'lucide-react';

interface RoomListProps {
  availabilities: RoomAvailability[];
  onResetFilters?: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  availabilities,
  onResetFilters,
}) => {
  if (availabilities.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="panel max-w-md mx-auto p-6 flex flex-col items-center justify-center bg-[var(--panel)]">
          <MonitorOff size={32} className="text-[var(--ink-3)] mb-2.5 opacity-60" />
          <h3 className="font-mono text-sm font-semibold text-[var(--ink)] mb-1">
            Inga salar matchar dina valda filter
          </h3>
          <p className="text-xs text-[var(--ink-3)] mb-3.5">
            Prova att ändra operativsystem, byggnad eller sökord.
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="panel px-3.5 py-1.5 text-xs font-mono text-[var(--ink)] hover:bg-[var(--panel-hover)] border-[var(--rule)]"
            >
              Återställ filter
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 pb-16">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {availabilities.map((avail) => (
          <RoomCard key={avail.room.id} availability={avail} />
        ))}
      </div>
    </main>
  );
};
