'use client';

import React from 'react';
import { RoomAvailability } from '@/types';
import { Monitor } from 'lucide-react';

interface StatSummaryProps {
  availabilities: RoomAvailability[];
}

export const StatSummary: React.FC<StatSummaryProps> = ({ availabilities }) => {
  const linuxRooms = availabilities.filter((a) => a.room.os === 'linux');
  const winRooms = availabilities.filter((a) => a.room.os === 'windows');

  const freeLinux = linuxRooms.filter((a) => a.status !== 'BUSY').length;
  const freeWin = winRooms.filter((a) => a.status !== 'BUSY').length;

  const totalFreeComputers = availabilities
    .filter((a) => a.status !== 'BUSY')
    .reduce((sum, a) => sum + a.room.computers, 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-5 grid grid-cols-3 gap-2.5 sm:gap-4">
      {/* Linux Available */}
      <div className="panel p-3 sm:p-4 text-center bg-[var(--panel)]">
        <div className="text-[11px] sm:text-xs font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-linux" />
          <span>Linux Salar</span>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-semibold text-accent-linux">
          {freeLinux} <span className="text-xs sm:text-sm font-normal text-[var(--ink-3)]">/ {linuxRooms.length}</span>
        </div>
      </div>

      {/* Windows Available */}
      <div className="panel p-3 sm:p-4 text-center bg-[var(--panel)]">
        <div className="text-[11px] sm:text-xs font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-win" />
          <span>Windows Salar</span>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-semibold text-accent-win">
          {freeWin} <span className="text-xs sm:text-sm font-normal text-[var(--ink-3)]">/ {winRooms.length}</span>
        </div>
      </div>

      {/* Free Computers */}
      <div className="panel p-3 sm:p-4 text-center bg-[var(--panel)]">
        <div className="text-[11px] sm:text-xs font-mono text-[var(--ink-3)] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
          <Monitor size={12} className="text-status-free" />
          <span className="truncate">Lediga Datorer</span>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-semibold text-status-free">
          {totalFreeComputers}
        </div>
      </div>
    </div>
  );
};
