'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ALL_BUILDINGS } from '@/data/rooms';
import { Search, X, Check, ChevronDown, Calendar } from 'lucide-react';

interface FilterBarProps {
  selectedOs: 'all' | 'linux' | 'windows';
  onSelectOs: (os: 'all' | 'linux' | 'windows') => void;
  selectedBuilding: string;
  onSelectBuilding: (building: string) => void;
  showOnlyAvailable: boolean;
  onToggleShowOnlyAvailable: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  linuxCount: number;
  windowsCount: number;
  totalCount: number;
  onOpenTimeMachine: () => void;
  isSimulating: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedOs,
  onSelectOs,
  selectedBuilding,
  onSelectBuilding,
  showOnlyAvailable,
  onToggleShowOnlyAvailable,
  searchQuery,
  onSearchChange,
  linuxCount,
  windowsCount,
  totalCount,
  onOpenTimeMachine,
  isSimulating,
}) => {
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsBuildingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Side: OS Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--panel)] border border-[var(--rule)] shrink-0">
          <button
            onClick={() => onSelectOs('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation ${
              selectedOs === 'all'
                ? 'bg-[var(--ink)] text-[var(--bg-bot)] font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            Alla ({totalCount})
          </button>
          <button
            onClick={() => onSelectOs('linux')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation ${
              selectedOs === 'linux'
                ? 'bg-accent-linux text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            🐧 Linux ({linuxCount})
          </button>
          <button
            onClick={() => onSelectOs('windows')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation ${
              selectedOs === 'windows'
                ? 'bg-accent-win text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            🪟 Windows ({windowsCount})
          </button>
        </div>

        {/* Right Side: Framtida tillgång + Endast lediga + Building Dropdown + Search Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap sm:flex-nowrap">
          {/* Framtida tid/dag Button (Placed right between Windows and Endast lediga) */}
          <button
            onClick={onOpenTimeMachine}
            className={`panel px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation ${
              isSimulating
                ? 'bg-status-sim/15 border-status-sim text-status-sim font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] border-[var(--rule)]'
            }`}
          >
            <Calendar size={13} className={isSimulating ? 'text-status-sim' : 'text-accent-linux'} />
            <span className="whitespace-nowrap">Framtida tid/dag</span>
          </button>

          {/* Endast Lediga Toggle */}
          <button
            onClick={onToggleShowOnlyAvailable}
            className={`panel px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation ${
              showOnlyAvailable
                ? 'bg-status-free/15 border-status-free text-status-free font-medium'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                showOnlyAvailable
                  ? 'bg-status-free border-status-free text-[var(--bg-bot)]'
                  : 'border-[var(--ink-3)]'
              }`}
            >
              {showOnlyAvailable && <Check size={10} strokeWidth={3} />}
            </div>
            <span className="whitespace-nowrap">Endast lediga</span>
          </button>

          {/* Custom Themed Building Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsBuildingOpen(!isBuildingOpen)}
              className="panel px-2.5 py-1 text-xs font-mono rounded-lg bg-[var(--panel)] border-[var(--rule)] text-[var(--ink)] hover:border-[var(--ink-3)] flex items-center gap-1.5 min-h-[32px] transition-colors"
            >
              <span>{selectedBuilding === 'All' ? 'Alla byggnader' : selectedBuilding}</span>
              <ChevronDown
                size={12}
                className={`text-[var(--ink-3)] transition-transform duration-150 ${
                  isBuildingOpen ? 'rotate-180 text-[var(--ink)]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isBuildingOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-44 py-1 rounded-lg bg-[var(--panel-solid)] border border-[var(--rule)] shadow-2xl backdrop-blur-xl animate-fadeIn">
                {ALL_BUILDINGS.map((b) => {
                  const isSelected = selectedBuilding === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        onSelectBuilding(b);
                        setIsBuildingOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs font-mono text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-accent-linux/15 text-accent-linux font-semibold'
                          : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
                      }`}
                    >
                      <span>{b === 'All' ? 'Alla byggnader' : b}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Search Box */}
          <div className="relative w-28 sm:w-36 md:w-40 shrink-0">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Sök sal..."
              className="w-full pl-6 pr-5 py-1 text-xs font-mono rounded-lg bg-[var(--panel)] border border-[var(--rule)] text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-accent-linux transition-colors min-h-[32px]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] p-0.5"
                aria-label="Clear search"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
