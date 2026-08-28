'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { ScheduleResponse, RoomAvailability } from '@/types';
import { calculateAllRoomsAvailability } from '@/lib/availability';
import { Header } from '@/components/Header';
import { HeroClock } from '@/components/HeroClock';
import { FilterBar } from '@/components/FilterBar';
import { RoomList } from '@/components/RoomList';
import { TimeMachineModal } from '@/components/TimeMachineModal';
import { translations } from '@/lib/i18n';
import { usePreferences } from '@/lib/usePreferences';
import { AlertCircle } from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Kunde inte ladda schema från TimeEdit');
    return res.json();
  });

export default function HomePage() {
  // Persistent User Preferences (Theme, Language, OS, Buildings, Available Only)
  const {
    preferences,
    toggleTheme,
    toggleLang,
    setSelectedOs,
    toggleBuilding,
    clearBuildings,
    toggleShowOnlyAvailable,
    resetFilters,
  } = usePreferences();

  const { theme, lang, selectedOs, selectedBuildings, showOnlyAvailable } = preferences;
  const t = translations[lang];

  // SWR for fetching schedule data with automatic background refresh
  const { data: schedule, error, isLoading, mutate } = useSWR<ScheduleResponse>(
    '/api/rooms',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 120000, // 2 minutes
      dedupingInterval: 30000,
    }
  );

  // Time & Simulation State (Always strictly live realtime on page load)
  const [simulatedTimeMs, setSimulatedTimeMs] = useState<number | null>(null);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [nowMinute, setNowMinute] = useState<number>(() => Math.floor(Date.now() / 60000));

  // Search query (Always starts blank on page load)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update current minute boundary every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMinute(Math.floor(Date.now() / 60000));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Active evaluation timestamp
  const activeEvalTimeMs = simulatedTimeMs ?? nowMinute * 60000;

  // Calculate availability for all 42 rooms
  const allAvailabilities = useMemo<RoomAvailability[]>(() => {
    return calculateAllRoomsAvailability(schedule || null, activeEvalTimeMs);
  }, [schedule, activeEvalTimeMs]);

  // Current fractional hour in Sweden time for Gantt needles
  const currentHour = useMemo(() => {
    const d = new Date(activeEvalTimeMs);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Stockholm',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const h = Number(parts.find((p) => p.type === 'hour')?.value || 12) % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    return h + m / 60;
  }, [activeEvalTimeMs]);

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...allAvailabilities];

    // OS Filter
    if (selectedOs !== 'all') {
      result = result.filter((a) => a.room.os === selectedOs);
    }

    // Multi-Building Filter
    if (selectedBuildings.length > 0) {
      result = result.filter((a) => selectedBuildings.includes(a.room.building));
    }

    // Available Only Filter
    if (showOnlyAvailable) {
      result = result.filter((a) => a.status !== 'BUSY');
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.room.name.toLowerCase().includes(q) ||
          a.room.building.toLowerCase().includes(q) ||
          (a.room.corridor && a.room.corridor.toLowerCase().includes(q))
      );
    }

    // Multi-tier Sorting:
    // 1. >= 10 computers, Free all day (A-Z)
    // 2. >= 10 computers, Free finite time (longest free time first, then A-Z)
    // 3. < 10 computers, Free all day (A-Z)
    // 4. < 10 computers, Free finite time (longest free time first, then A-Z)
    // 5. >= 10 computers, Busy (soonest opening first, then A-Z)
    // 6. < 10 computers, Busy (soonest opening first, then A-Z)
    result.sort((a, b) => {
      const getTier = (item: RoomAvailability) => {
        const isAvail = item.status !== 'BUSY';
        const hasMany = item.room.computers >= 10;
        const isAllDay = isAvail && (item.freeMinutesRemaining === undefined || item.freeUntil === undefined);

        if (isAvail) {
          if (hasMany) return isAllDay ? 1 : 2;
          return isAllDay ? 3 : 4;
        } else {
          return hasMany ? 5 : 6;
        }
      };

      const tierA = getTier(a);
      const tierB = getTier(b);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      // Tier 1 & 3: Free all day -> sort A-Z
      if (tierA === 1 || tierA === 3) {
        return a.room.name.localeCompare(b.room.name, 'sv');
      }

      // Tier 2 & 4: Free finite time -> sort longest remaining time first, then A-Z
      if (tierA === 2 || tierA === 4) {
        const diff = (b.freeMinutesRemaining || 0) - (a.freeMinutesRemaining || 0);
        if (diff !== 0) return diff;
        return a.room.name.localeCompare(b.room.name, 'sv');
      }

      // Tier 5 & 6: Busy -> sort earliest opening first, then A-Z
      const diff = (a.busyUntil || 0) - (b.busyUntil || 0);
      if (diff !== 0) return diff;
      return a.room.name.localeCompare(b.room.name, 'sv');
    });

    return result;
  }, [allAvailabilities, selectedOs, selectedBuildings, showOnlyAvailable, searchQuery]);

  const freeCount = allAvailabilities.filter((a) => a.status !== 'BUSY').length;
  const linuxCount = allAvailabilities.filter((a) => a.room.os === 'linux').length;
  const windowsCount = allAvailabilities.filter((a) => a.room.os === 'windows').length;

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setSearchQuery('');
  }, [resetFilters]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Header with Persistent Theme & Language Toggle & Info */}
        <Header
          onRefresh={() => mutate()}
          isLoading={isLoading}
          lastUpdated={schedule?.fetchedAt}
          lang={lang}
          onToggleLang={toggleLang}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Hero Clock */}
        <HeroClock
          simulatedTimeMs={simulatedTimeMs}
          onResetTimeMachine={() => setSimulatedTimeMs(null)}
          freeRoomsCount={freeCount}
          totalRoomsCount={allAvailabilities.length}
          isLoading={isLoading && !schedule}
          lang={lang}
        />

        {/* Loading / Error States */}
        {error && !schedule && (
          <div className="w-full max-w-5xl mx-auto px-4 mb-4">
            <div className="panel p-3 bg-status-busy/10 border-status-busy/30 text-status-busy flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} />
                <span>
                  {lang === 'en'
                    ? 'Failed to fetch schedule from TimeEdit. Showing cached/fallback data.'
                    : 'Kunde inte hämta schema från TimeEdit. Visar cachelagrad data.'}
                </span>
              </div>
              <button
                onClick={() => mutate()}
                className="underline hover:text-white cursor-pointer"
              >
                {lang === 'en' ? 'Retry' : 'Försök igen'}
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar with Persistent Filters */}
        <FilterBar
          selectedOs={selectedOs}
          onSelectOs={setSelectedOs}
          selectedBuildings={selectedBuildings}
          onToggleBuilding={toggleBuilding}
          onClearBuildings={clearBuildings}
          showOnlyAvailable={showOnlyAvailable}
          onToggleShowOnlyAvailable={toggleShowOnlyAvailable}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          linuxCount={linuxCount}
          windowsCount={windowsCount}
          totalCount={allAvailabilities.length}
          onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
          isSimulating={simulatedTimeMs !== null}
          lang={lang}
        />

        {/* Room List */}
        <RoomList
          availabilities={filteredAndSortedRooms}
          currentHour={currentHour}
          onResetFilters={handleResetFilters}
          lang={lang}
        />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--rule-faint)] py-4 text-center text-[11px] font-mono text-[var(--ink-3)] flex items-center justify-center gap-1.5 flex-nowrap px-2">
        <span>{t.footerText}</span>
        <span>•</span>
        <a
          href="https://github.com/joehu131/liu-lab-rooms"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--ink)] underline transition-colors shrink-0"
        >
          github
        </a>
      </footer>

      {/* Time Machine Modal */}
      <TimeMachineModal
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        currentTimeMs={nowMinute * 60000}
        simulatedTimeMs={simulatedTimeMs}
        onApplySimulation={setSimulatedTimeMs}
        lang={lang}
      />
    </div>
  );
}
