'use client';

import React, { memo } from 'react';
import { RoomAvailability } from '@/types';
import { formatMinutes, formatStockholmTime } from '@/lib/formatters';
import { MapPin } from 'lucide-react';

interface RoomCardProps {
  availability: RoomAvailability;
}

const RoomCardComponent: React.FC<RoomCardProps> = ({ availability }) => {
  const { room, status, freeUntil, freeMinutesRemaining, busyUntil, currentBooking } =
    availability;

  const isLinux = room.os === 'linux';

  // Status Badge Colors & Text
  let statusBadgeClasses = 'bg-status-free/15 text-status-free border-[var(--rule)]';
  let statusDotColor = 'bg-status-free shadow-[0_0_5px_var(--status-free)]';
  let statusText = 'Ledig hela dagen';

  if (status === 'BUSY') {
    statusBadgeClasses = 'bg-status-busy/15 text-status-busy border-[var(--rule)]';
    statusDotColor = 'bg-status-busy shadow-[0_0_5px_var(--status-busy)]';
    const busyUntilStr = busyUntil ? formatStockholmTime(busyUntil) : '';
    statusText = busyUntilStr ? `Upptagen till ${busyUntilStr}` : 'Upptagen';
    if (currentBooking?.courseCode) {
      statusText += ` (${currentBooking.courseCode})`;
    }
  } else if (status === 'ENDING_SOON') {
    statusBadgeClasses = 'bg-status-warn/15 text-status-warn border-[var(--rule)]';
    statusDotColor = 'bg-status-warn shadow-[0_0_5px_var(--status-warn)] animate-pulse';
    const nextStartStr = freeUntil ? formatStockholmTime(freeUntil) : '';
    const minsStr = freeMinutesRemaining !== undefined ? ` (${formatMinutes(freeMinutesRemaining)})` : '';
    statusText = nextStartStr ? `Ledig till ${nextStartStr}${minsStr}` : 'Snart upptagen';
  } else if (status === 'FREE') {
    if (freeMinutesRemaining !== undefined && freeUntil) {
      statusText = `Ledig till ${formatStockholmTime(freeUntil)} (${formatMinutes(freeMinutesRemaining)})`;
    } else {
      statusText = 'Ledig hela dagen';
    }
  }

  return (
    <div className="room-row px-3 py-1 sm:py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
      {/* Left: Room Name + Building + Floor + OS */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-tight text-[var(--ink)] min-w-[60px]">
            {room.name}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium border border-[var(--rule)] shrink-0 ${
              isLinux
                ? 'bg-accent-linux/10 text-accent-linux'
                : 'bg-accent-win/10 text-accent-win'
            }`}
          >
            {isLinux ? '🐧 Linux' : '🪟 Win'}
          </span>
        </div>

        <div className="text-[11px] text-[var(--ink-3)] font-mono flex items-center gap-1.5 shrink-0">
          <span className="text-[var(--ink-2)]">{room.building}</span>
          <span>•</span>
          <span>Plan {room.floor}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">{room.computers} datorer</span>
        </div>
      </div>

      {/* Right: Availability Badge + Mazemap Link */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
        {/* Availability Badge */}
        <div
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border flex items-center gap-1.5 ${statusBadgeClasses}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} />
          <span className="truncate max-w-[210px] sm:max-w-[280px]">{statusText}</span>
        </div>

        {/* Mazemap icon link */}
        <a
          href={room.mazemapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded text-[var(--ink-3)] hover:text-accent-linux border border-transparent hover:border-[var(--rule)] transition-colors shrink-0 flex items-center justify-center min-h-[26px] min-w-[26px]"
          title={`Hitta ${room.name} på Mazemap`}
          aria-label={`Hitta ${room.name} på Mazemap`}
        >
          <MapPin size={12} />
        </a>
      </div>
    </div>
  );
};

export const RoomCard = memo(RoomCardComponent);
