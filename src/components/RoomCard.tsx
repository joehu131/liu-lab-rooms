'use client';

import React, { memo, useState } from 'react';
import { RoomAvailability } from '@/types';
import { formatMinutes, formatStockholmTime, formatStockholmDate } from '@/lib/formatters';
import { GanttRibbon } from './GanttRibbon';
import { WindowsIcon } from './FilterBar';
import { MapPin, ChevronDown, Monitor, Users, Building } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface RoomCardProps {
  availability: RoomAvailability;
  currentHour?: number;
  lang?: Language;
}

const RoomCardComponent: React.FC<RoomCardProps> = ({
  availability,
  currentHour,
  lang = 'sv',
}) => {
  const { room, status, freeUntil, freeMinutesRemaining, busyUntil, currentBooking, ganttSegments, todayBookings } =
    availability;

  const [isExpanded, setIsExpanded] = useState(false);
  const isLinux = room.os === 'linux';
  const t = translations[lang];

  // Status Badge Colors & Text
  let statusBadgeClasses = 'bg-status-free/15 text-status-free border-[var(--rule)]';
  let statusDotColor = 'bg-status-free shadow-[0_0_4px_var(--status-free)]';
  let statusText = t.allDayFree;
  let fullExplanation = t.allDayFreeTooltip;

  if (status === 'BUSY') {
    statusBadgeClasses = 'bg-status-busy/15 text-status-busy border-[var(--rule)]';
    statusDotColor = 'bg-status-busy shadow-[0_0_4px_var(--status-busy)]';
    const busyUntilStr = busyUntil ? formatStockholmTime(busyUntil) : '';
    statusText = busyUntilStr ? busyUntilStr : t.busyNow;
    fullExplanation = t.busyUntilTooltip(busyUntilStr, currentBooking?.courseCode);
  } else if (status === 'ENDING_SOON') {
    statusBadgeClasses = 'bg-status-warn/15 text-status-warn border-[var(--rule)]';
    statusDotColor = 'bg-status-warn shadow-[0_0_4px_var(--status-warn)] animate-pulse';
    const nextStartStr = freeUntil ? formatStockholmTime(freeUntil) : '';
    const minsStr = freeMinutesRemaining !== undefined ? ` (${formatMinutes(freeMinutesRemaining)})` : '';
    statusText = nextStartStr ? `${nextStartStr}${minsStr}` : t.busySoon;
    fullExplanation = t.freeUntilTooltip(nextStartStr, formatMinutes(freeMinutesRemaining || 0));
  } else if (status === 'FREE') {
    if (freeMinutesRemaining !== undefined && freeUntil) {
      const nextStartStr = formatStockholmTime(freeUntil);
      const minsStr = ` (${formatMinutes(freeMinutesRemaining)})`;
      statusText = `${nextStartStr}${minsStr}`;
      fullExplanation = t.freeUntilTooltip(nextStartStr, formatMinutes(freeMinutesRemaining));
    } else {
      statusText = t.allDayFree;
      fullExplanation = t.allDayFreeTooltip;
    }
  }

  // Format short date "D/M" in Sweden time
  const formatShortDate = (ms: number) => {
    const d = new Date(ms);
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      day: 'numeric',
      month: 'numeric',
    }).formatToParts(d);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    return `${day}/${month}`;
  };

  return (
    <div className="room-row flex flex-col">
      {/* Main Single-Line Row (Only this top row lights up on hover) */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="px-2 sm:px-3 py-1.5 flex flex-row items-center justify-between gap-1.5 sm:gap-2 w-full cursor-pointer select-none hover:bg-[var(--panel-hover)] transition-colors"
      >
        {/* Left: Room Name + OS + Location/Computers (Auto-truncates with ...) */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden">
          <span className="font-mono text-xs sm:text-[13px] font-semibold tracking-tight text-[var(--ink)] shrink-0">
            {room.name}
          </span>

          {/* OS Pill (Subtle background, no harsh outer border) */}
          <span
            className={`inline-flex items-center gap-1 px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[9.5px] font-mono font-medium shrink-0 ${
              isLinux
                ? 'bg-accent-win/10 text-accent-win'
                : 'bg-accent-linux/10 text-accent-linux'
            }`}
          >
            {isLinux ? (
              <>
                <span>🐧</span>
                <span>Linux</span>
              </>
            ) : (
              <>
                <WindowsIcon className="w-2.5 h-2.5" />
                <span>Win</span>
              </>
            )}
          </span>

          <span className="text-[10px] sm:text-[10.5px] text-[var(--ink-3)] font-mono truncate min-w-0">
            <span>{room.building}</span>
            <span className="hidden sm:inline"> • {t.floor} {room.floor} • {room.computers} {t.computers}</span>
          </span>
        </div>

        {/* Right: Availability Badge + Mazemap Link + Expand Chevron */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Availability Badge */}
          <div
            title={fullExplanation}
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono font-medium border flex items-center gap-1 shrink-0 ${statusBadgeClasses}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} />
            <span className="whitespace-nowrap">{statusText}</span>
          </div>

          {/* Mazemap Link Icon (stops accordion propagation) */}
          <a
            href={room.mazemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-[var(--ink-3)] hover:text-accent-linux transition-colors shrink-0 flex items-center justify-center min-h-[22px] min-w-[22px]"
            title={t.findOnMazemap(room.name)}
            aria-label={t.findOnMazemap(room.name)}
          >
            <MapPin size={12} />
          </a>

          {/* Expand / Collapse Chevron */}
          <div className="p-0.5 text-[var(--ink-3)]">
            <ChevronDown
              size={13}
              className={`transition-transform duration-150 ${isExpanded ? 'rotate-180 text-[var(--ink)]' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Accordion Drawer (Schedule & Room Specs) */}
      {isExpanded && (
        <div className="px-3 py-2.5 bg-transparent border-t border-[var(--rule-faint)] space-y-2.5 animate-fadeIn text-xs font-mono">
          {/* Top Specs & Mazemap Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[var(--rule-faint)]">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px] text-[var(--ink-2)]">
              <div className="flex items-center gap-1.5">
                <Building size={12} className="text-accent-linux shrink-0" />
                <span>{room.building}, {t.floor} {room.floor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Monitor size={12} className="text-accent-linux shrink-0" />
                <span>{room.computers} ({isLinux ? 'Linux' : 'Windows'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-accent-linux shrink-0" />
                <span>{room.seats}</span>
              </div>
            </div>

            {/* Mazemap Link on the Top Row */}
            <a
              href={room.mazemapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="panel px-2.5 py-1 text-[11px] font-mono text-[var(--ink)] hover:text-accent-linux hover:border-accent-linux transition-colors flex items-center gap-1.5 shrink-0"
            >
              <MapPin size={12} className="text-accent-linux" />
              <span>{t.openMazemap} ({t.floor} {room.floor})</span>
            </a>
          </div>

          {/* Mini Gantt Timeline Bar */}
          <div>
            <div className="text-[11px] font-semibold text-[var(--ink)] mb-0.5">
              {t.roomSchedule}
            </div>
            <GanttRibbon segments={ganttSegments} currentHour={currentHour} lang={lang} />
          </div>

          {/* List of Bookings for the day (Full text wraps cleanly on mobile) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-[var(--ink)]">
              {t.bookingsTitle(todayBookings.length)}
            </div>
            {todayBookings.length === 0 ? (
              <div className="text-[11px] text-status-free flex items-center gap-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-free" />
                <span>{t.noBookingsToday}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {todayBookings.map((bk, i) => {
                  const startStr = formatStockholmTime(bk.start);
                  const endStr = formatStockholmTime(bk.end);
                  const startDateStr = formatStockholmDate(bk.start);
                  const endDateStr = formatStockholmDate(bk.end);

                  const isMultiDay = startDateStr !== endDateStr;
                  const showStartDate = isMultiDay;
                  const showEndDate = isMultiDay;

                  return (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[11px] py-1.5 px-2.5 rounded bg-[var(--panel-solid)] border border-[var(--rule-faint)]"
                    >
                      {/* Top / Left: Time Range + Course Code + Activity Type */}
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {/* Time Range with optional multi-day date badges */}
                        <div className="flex items-center gap-1 font-semibold text-[var(--ink)]">
                          {showStartDate && (
                            <span className="text-[10px] text-[var(--ink-3)] font-normal">
                              ({formatShortDate(bk.start)})
                            </span>
                          )}
                          <span>{startStr}</span>
                          <span>–</span>
                          <span>{endStr}</span>
                          {showEndDate && (
                            <span className="text-[10px] text-status-sim font-normal">
                              ({formatShortDate(bk.end)})
                            </span>
                          )}
                        </div>

                        {/* Course Code */}
                        {bk.courseCode && (
                          <span className="text-accent-linux px-1.5 py-0.2 rounded bg-accent-linux/15 font-medium">
                            {bk.courseCode}
                          </span>
                        )}

                        {/* Undervisningstyp (Only if present!) */}
                        {bk.activityType && (
                          <span className="text-status-sim px-1.5 py-0.2 rounded bg-status-sim/10 font-medium">
                            {bk.activityType}
                          </span>
                        )}
                      </div>

                      {/* Event description / name (Wraps gracefully on mobile so full text is always visible) */}
                      {bk.info && (
                        <div className="text-[var(--ink-2)] text-[10px] sm:text-[11px] leading-snug break-words">
                          {bk.info}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const RoomCard = memo(RoomCardComponent, (prev, next) => {
  return (
    prev.lang === next.lang &&
    prev.currentHour === next.currentHour &&
    prev.availability.status === next.availability.status &&
    prev.availability.freeUntil === next.availability.freeUntil &&
    prev.availability.busyUntil === next.availability.busyUntil &&
    prev.availability.freeMinutesRemaining === next.availability.freeMinutesRemaining &&
    prev.availability.room.id === next.availability.room.id &&
    prev.availability.todayBookings.length === next.availability.todayBookings.length
  );
});
