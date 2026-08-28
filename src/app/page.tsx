'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ScheduleResponse, RoomAvailability } from '@/types';
import { calculateAllRoomsAvailability } from '@/lib/availability';
import { Header } from '@/components/Header';
import { HeroClock } from '@/components/HeroClock';
import { FilterBar } from '@/components/FilterBar';
import { RoomList } from '@/components/RoomList';
import { TimeMachineModal } from '@/components/TimeMachineModal';
import { Loader2, AlertCircle } from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Kunde inte ladda schema från TimeEdit');
    return res.json();
  });

export default function HomePage() {
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

  // Time & Simulation State
  const [simulatedTimeMs, setSimulatedTimeMs] = useState<number | null>(null);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [nowMinute, setNowMinute] = useState<number>(() => Math.floor(Date.now() / 60000));

  // Update current minute boundary every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMinute(Math.floor(Date.now() / 60000));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter State
  const [selectedOs, setSelectedOs] = useState<'all' | 'linux' | 'windows'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active evaluation timestamp
  const activeEvalTimeMs = simulatedTimeMs ?? nowMinute * 60000;

  // Calculate availability for all 42 rooms
  const allAvailabilities = useMemo<RoomAvailability[]>(() => {
    return calculateAllRoomsAvailability(schedule || null, activeEvalTimeMs);
  }, [schedule, activeEvalTimeMs]);

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...allAvailabilities];

    // OS Filter
    if (selectedOs !== 'all') {
      result = result.filter((a) => a.room.os === selectedOs);
    }

    // Building Filter
    if (selectedBuilding !== 'All') {
      result = result.filter((a) => a.room.building === selectedBuilding);
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
  }, [allAvailabilities, selectedOs, selectedBuilding, showOnlyAvailable, searchQuery]);

  const freeCount = allAvailabilities.filter((a) => a.status !== 'BUSY').length;
  const linuxCount = allAvailabilities.filter((a) => a.room.os === 'linux').length;
  const windowsCount = allAvailabilities.filter((a) => a.room.os === 'windows').length;

  const handleResetFilters = () => {
    setSelectedOs('all');
    setSelectedBuilding('All');
    setShowOnlyAvailable(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Header with Theme Toggle & Info */}
        <Header
          onRefresh={() => mutate()}
          isLoading={isLoading}
          lastUpdated={schedule?.fetchedAt}
        />

        {/* Hero Clock */}
        <HeroClock
          simulatedTimeMs={simulatedTimeMs}
          onResetTimeMachine={() => setSimulatedTimeMs(null)}
          freeRoomsCount={freeCount}
          totalRoomsCount={allAvailabilities.length}
        />

        {/* Loading / Error States */}
        {error && (
          <div className="w-full max-w-5xl mx-auto px-4 mb-4">
            <div className="p-3 rounded-lg bg-status-busy/15 border border-status-busy/30 text-xs font-mono text-status-busy flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error.message || 'Kunde inte hämta schemadata. Försöker igen...'}</span>
            </div>
          </div>
        )}

        {isLoading && !schedule && (
          <div className="w-full max-w-5xl mx-auto px-4 py-8 text-center text-xs font-mono text-[var(--ink-3)] flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-accent-linux" />
            <span>Hämtar datorsalsscheman från TimeEdit...</span>
          </div>
        )}

        {/* Filter Controls */}
        {schedule && (
          <FilterBar
            selectedOs={selectedOs}
            onSelectOs={setSelectedOs}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
            showOnlyAvailable={showOnlyAvailable}
            onToggleShowOnlyAvailable={() => setShowOnlyAvailable(!showOnlyAvailable)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            linuxCount={linuxCount}
            windowsCount={windowsCount}
            totalCount={allAvailabilities.length}
            onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
            isSimulating={simulatedTimeMs !== null}
          />
        )}

        {/* Room Rows List */}
        {schedule && (
          <RoomList
            availabilities={filteredAndSortedRooms}
            onResetFilters={handleResetFilters}
          />
        )}
      </div>

      {/* Footer info */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 border-t border-[var(--rule)] text-center text-[11px] font-mono text-[var(--ink-3)]">
        <span>Linköping University • Campus Valla • Salsschema TimeEdit</span>
      </footer>

      {/* Time Machine Modal Drawer */}
      <TimeMachineModal
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        currentTimeMs={Date.now()}
        simulatedTimeMs={simulatedTimeMs}
        onApplySimulation={(targetMs) => setSimulatedTimeMs(targetMs)}
      />
    </div>
  );
}
