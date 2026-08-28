'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ALL_BUILDINGS } from '@/data/rooms';
import { Search, X, Check, ChevronDown, Calendar } from 'lucide-react';

// Authentic Windows 4-square logo
export const WindowsIcon = ({ className = 'w-3 h-3 shrink-0' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M0 2.222L6.5 1.333v6.222H0V2.222zm7.5-1.467L16 0v7.556H7.5V.755zM0 8.444h6.5v6.223L0 13.778V8.444zm7.5 0H16V16l-8.5-.756V8.444z" />
  </svg>
);

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
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation cursor-pointer ${
              selectedOs === 'all'
                ? 'bg-slate-200 text-slate-900 dark:bg-[var(--ink)] dark:text-[var(--bg-bot)] font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            Alla ({totalCount})
          </button>
          <button
            onClick={() => onSelectOs('linux')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation flex items-center gap-1.5 cursor-pointer ${
              selectedOs === 'linux'
                ? 'bg-accent-win text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            <span>🐧</span>
            <span>Linux ({linuxCount})</span>
          </button>
          <button
            onClick={() => onSelectOs('windows')}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation flex items-center gap-1.5 cursor-pointer ${
              selectedOs === 'windows'
                ? 'bg-accent-linux text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            <WindowsIcon className="w-3 h-3" />
            <span>Windows ({windowsCount})</span>
          </button>
        </div>

        {/* Right Side: Framtida tillgång + Endast lediga + Building Dropdown + Search Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap sm:flex-nowrap">
          {/* Framtida tid/dag Button */}
          <button
            onClick={onOpenTimeMachine}
            className={`panel px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation cursor-pointer ${
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
            className={`panel px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation cursor-pointer ${
              showOnlyAvailable
                ? 'bg-status-free/15 border-status-free text-status-free font-medium'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
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
              onClick={() => setIsBuildingOpen(!isBuildingOpen)}
              className="panel px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--ink)] flex items-center gap-1.5 hover:bg-[var(--panel-hover)] transition-all min-h-[32px] cursor-pointer"
            >
              <span className="truncate max-w-[110px]">
                {selectedBuilding === 'All' ? 'Alla byggnader' : selectedBuilding}
              </span>
              <ChevronDown
                size={13}
                className={`text-[var(--ink-3)] transition-transform duration-150 ${
                  isBuildingOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Custom Styled Dropdown Menu */}
            {isBuildingOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg bg-[var(--panel-solid)] border border-[var(--rule)] shadow-2xl py-1 z-30 font-mono text-xs animate-fadeIn">
                <button
                  onClick={() => {
                    onSelectBuilding('All');
                    setIsBuildingOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[var(--panel-hover)] transition-colors cursor-pointer ${
                    selectedBuilding === 'All'
                      ? 'text-accent-linux font-semibold bg-accent-linux/10'
                      : 'text-[var(--ink-2)]'
                  }`}
                >
                  <span>Alla byggnader</span>
                  {selectedBuilding === 'All' && <Check size={12} />}
                </button>

                <div className="my-1 border-t border-[var(--rule-faint)]" />

                {ALL_BUILDINGS.filter((b) => b !== 'All').map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      onSelectBuilding(b);
                      setIsBuildingOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[var(--panel-hover)] transition-colors cursor-pointer ${
                      selectedBuilding === b
                        ? 'text-accent-linux font-semibold bg-accent-linux/10'
                        : 'text-[var(--ink-2)]'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBuilding === b && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative shrink-0 w-32 sm:w-36 md:w-44">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Sök sal..."
              className="panel w-full pl-7 pr-6 py-1 text-xs font-mono text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-accent-linux transition-colors min-h-[32px]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
