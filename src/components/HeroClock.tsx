'use client';

import React, { useEffect, useState } from 'react';
import { formatStockholmTime, formatWeekdayLabel } from '@/lib/formatters';
import { Language, translations } from '@/lib/i18n';

interface HeroClockProps {
  simulatedTimeMs: number | null;
  onResetTimeMachine: () => void;
  freeRoomsCount: number;
  totalRoomsCount: number;
  isLoading?: boolean;
  lang?: Language;
}

export const HeroClock: React.FC<HeroClockProps> = ({
  simulatedTimeMs,
  onResetTimeMachine,
  freeRoomsCount,
  totalRoomsCount,
  isLoading = false,
  lang = 'sv',
}) => {
  const [liveTimeMs, setLiveTimeMs] = useState<number>(() => Date.now());

  const t = translations[lang];

  // Isolated 1-second tick timer for the clock display
  useEffect(() => {
    if (simulatedTimeMs !== null) return;

    const interval = setInterval(() => {
      setLiveTimeMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [simulatedTimeMs]);

  const displayTimeMs = simulatedTimeMs !== null ? simulatedTimeMs : liveTimeMs;
  const timeStr = formatStockholmTime(displayTimeMs);
  const [hrs, mins] = timeStr.split(':');

  const isSimulating = simulatedTimeMs !== null;

  // Format date in Swedish or English: e.g. "FREDAG • 28 AUGUSTI" or "FRIDAY • AUGUST 28"
  const locale = lang === 'en' ? 'en-US' : 'sv-SE';
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Stockholm',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const parts = dateFormatter.formatToParts(new Date(displayTimeMs));
  const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const dateFormatted = lang === 'en'
    ? `${weekday} • ${month} ${day}`.toUpperCase()
    : `${weekday} • ${day} ${month}`.toUpperCase();

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pt-2 sm:pt-4 pb-2 sm:pb-3 text-center">
      {/* Floating Date (Snug Above Clock) */}
      <div className="-mb-1 sm:-mb-2 flex items-center justify-center">
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] sm:text-xs tracking-widest uppercase transition-colors select-none ${
            isSimulating
              ? 'bg-status-sim/10 text-status-sim border border-status-sim/20'
              : 'text-[var(--ink-3)]'
          }`}
        >
          {isSimulating && (
            <span className="w-1.5 h-1.5 rounded-full bg-status-sim animate-pulse" />
          )}
          <span>{dateFormatted}</span>
        </div>
      </div>

      {/* Clock Numbers */}
      <div
        id="clock"
        className="font-mono text-6xl sm:text-7xl md:text-8xl font-light tracking-tight text-[var(--ink)] select-none leading-tight"
      >
        <span className="hrs">{hrs}</span>
        <span className="mins opacity-60">:{mins}</span>
      </div>

      {/* Subtitle / Status indicator */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {isLoading ? (
          <div
            id="running"
            className="font-mono text-xs sm:text-sm tracking-wider uppercase text-[var(--ink-3)] flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-accent-linux animate-pulse" />
            <span>{t.loadingStatus}</span>
          </div>
        ) : isSimulating ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-status-sim/15 text-status-sim border border-status-sim/30">
            <span className="w-2 h-2 rounded-full bg-status-sim shadow-[0_0_8px_var(--status-sim)] animate-pulse" />
            <span>
              {t.simulatingStatus(
                formatWeekdayLabel(displayTimeMs, Date.now(), lang),
                `${hrs}:${mins}`,
                freeRoomsCount,
                totalRoomsCount
              )}
            </span>
            <button
              onClick={onResetTimeMachine}
              className="ml-1 text-[var(--ink)] hover:text-white underline font-semibold cursor-pointer"
              title={t.resetLiveTitle}
            >
              [{t.resetLive}]
            </button>
          </div>
        ) : (
          <div
            id="running"
            className="font-mono text-xs sm:text-sm tracking-wider uppercase text-[var(--ink-3)] flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-status-free shadow-[0_0_6px_var(--status-free)]" />
            <span>
              {t.liveStatus(freeRoomsCount, totalRoomsCount)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
