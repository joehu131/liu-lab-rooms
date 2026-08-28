'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ALL_BUILDINGS } from '@/data/rooms';
import { Search, X, Check, ChevronDown, Calendar, SlidersHorizontal } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

// Authentic Windows 4-square logo
export const WindowsIcon = ({ className = 'w-3 h-3 shrink-0' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M0 2.222L6.5 1.333v6.222H0V2.222zm7.5-1.467L16 0v7.556H7.5V.755zM0 8.444h6.5v6.223L0 13.778V8.444zm7.5 0H16V16l-8.5-.756V8.444z" />
  </svg>
);

interface FilterBarProps {
  selectedOs: 'all' | 'linux' | 'windows';
  onSelectOs: (os: 'all' | 'linux' | 'windows') => void;
  selectedBuildings: string[];
  onToggleBuilding: (building: string) => void;
  onClearBuildings: () => void;
  showOnlyAvailable: boolean;
  onToggleShowOnlyAvailable: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  linuxCount: number;
  windowsCount: number;
  totalCount: number;
  onOpenTimeMachine: () => void;
  isSimulating: boolean;
  lang?: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedOs,
  onSelectOs,
  selectedBuildings,
  onToggleBuilding,
  onClearBuildings,
  showOnlyAvailable,
  onToggleShowOnlyAvailable,
  searchQuery,
  onSearchChange,
  linuxCount,
  windowsCount,
  totalCount,
  onOpenTimeMachine,
  isSimulating,
  lang = 'sv',
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Available campus buildings without 'All'
  const buildingsList = ALL_BUILDINGS.filter((b) => b !== 'All');

  // Desktop label calculation
  const getDesktopBuildingLabel = () => {
    if (selectedBuildings.length === 0) return t.allBuildings;
    if (selectedBuildings.length === 1) return selectedBuildings[0];
    return t.selectedBuildingsCount(selectedBuildings.length);
  };

  // Active filters count for mobile "Filter (N)" badge
  const activeFiltersCount = (showOnlyAvailable ? 1 : 0) + selectedBuildings.length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-3">
      {/* Mobile Search Overlay Bar (When search icon is clicked on mobile) */}
      {isMobileSearchOpen && (
        <div className="sm:hidden mb-2 flex items-center gap-2 animate-fadeIn">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-linux pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="panel w-full pl-8 pr-8 py-1.5 text-xs font-mono text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-accent-linux transition-colors min-h-[36px]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] p-1 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              onSearchChange('');
            }}
            className="panel px-3 py-1.5 text-xs font-mono text-[var(--ink-2)] hover:text-[var(--ink)] min-h-[36px] cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      )}

      {/* Main Filter Bar Container (Stacked full-width on mobile, side-by-side on desktop) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
        {/* Row 1 on Mobile: OS Filter Pills (Stretches 100% full width with equal 1/3 columns on mobile) */}
        <div className="w-full sm:w-auto flex items-center gap-1 p-0.5 rounded-lg bg-[var(--panel)] border border-[var(--rule)] shrink-0">
          <button
            onClick={() => onSelectOs('all')}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation cursor-pointer flex items-center justify-center text-center ${
              selectedOs === 'all'
                ? 'bg-slate-200 text-slate-900 dark:bg-[var(--ink)] dark:text-[var(--bg-bot)] font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            {t.allPill(totalCount)}
          </button>
          <button
            onClick={() => onSelectOs('linux')}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              selectedOs === 'linux'
                ? 'bg-accent-win text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            <span>🐧</span>
            <span>{t.linuxPill(linuxCount)}</span>
          </button>
          <button
            onClick={() => onSelectOs('windows')}
            className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-xs font-mono transition-all min-h-[32px] touch-manipulation flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              selectedOs === 'windows'
                ? 'bg-accent-linux text-white font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
            }`}
          >
            <WindowsIcon className="w-3 h-3" />
            <span>{t.windowsPill(windowsCount)}</span>
          </button>
        </div>

        {/* Row 2 on Mobile: Secondary Actions Row (Stretches 100% full width to match Row 1 exactly) */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 sm:gap-2 sm:ml-auto">
          {/* Framtida tid/dag Button (Expands on mobile for clean symmetry) */}
          <button
            onClick={onOpenTimeMachine}
            className={`flex-1 sm:flex-initial panel px-2.5 py-1 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation cursor-pointer ${
              isSimulating
                ? 'bg-status-sim/15 border-status-sim text-status-sim font-semibold shadow-sm'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] border-[var(--rule)]'
            }`}
          >
            <Calendar size={13} className={isSimulating ? 'text-status-sim' : 'text-accent-linux'} />
            <span className="whitespace-nowrap">{t.futureBtn}</span>
          </button>

          {/* Endast Lediga Toggle (Desktop ONLY - on mobile it lives inside the Filter dropdown) */}
          <button
            onClick={onToggleShowOnlyAvailable}
            className={`hidden sm:flex panel px-2.5 py-1 rounded-lg text-xs font-mono items-center gap-1.5 transition-all min-h-[32px] shrink-0 touch-manipulation cursor-pointer ${
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
            <span className="whitespace-nowrap">{t.onlyAvailable}</span>
          </button>

          {/* Filter Dropdown (Says "Filter" on mobile, "Alla byggnader / X byggnader" on desktop) */}
          <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`w-full sm:w-auto panel px-2.5 py-1 rounded-lg text-xs font-mono text-[var(--ink)] flex items-center justify-center sm:justify-start gap-1.5 hover:bg-[var(--panel-hover)] transition-all min-h-[32px] cursor-pointer ${
                activeFiltersCount > 0
                  ? 'border-accent-linux text-accent-linux font-medium'
                  : ''
              }`}
            >
              <SlidersHorizontal size={12} className="sm:hidden text-accent-linux shrink-0" />
              {/* Mobile label: "Filter" */}
              <span className="sm:hidden font-medium">
                {t.filterMobileBtn}
                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </span>
              {/* Desktop label: Building name */}
              <span className="hidden sm:inline truncate max-w-[120px]">
                {getDesktopBuildingLabel()}
              </span>
              <ChevronDown
                size={13}
                className={`text-[var(--ink-3)] transition-transform duration-150 shrink-0 ${
                  isFilterDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Anchored Dropdown Menu (Guaranteed within viewport on mobile) */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 max-w-[calc(100vw-32px)] rounded-xl bg-[var(--panel-solid)] border border-[var(--rule)] shadow-2xl py-1.5 z-40 font-mono text-xs animate-fadeIn">
                {/* Mobile-only: Endast lediga checkbox at the top */}
                <div className="sm:hidden">
                  <button
                    onClick={onToggleShowOnlyAvailable}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[var(--panel-hover)] transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-[var(--ink)]">{t.onlyAvailable}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        showOnlyAvailable
                          ? 'bg-status-free border-status-free text-slate-900'
                          : 'border-[var(--ink-3)]'
                      }`}
                    >
                      {showOnlyAvailable && <Check size={11} strokeWidth={3} />}
                    </div>
                  </button>
                  <div className="my-1 border-t border-[var(--rule-faint)]" />
                </div>

                {/* All Buildings Checkbox item */}
                <button
                  onClick={onClearBuildings}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[var(--panel-hover)] transition-colors cursor-pointer ${
                    selectedBuildings.length === 0
                      ? 'text-accent-linux font-semibold bg-accent-linux/10'
                      : 'text-[var(--ink-2)]'
                  }`}
                >
                  <span>{t.allBuildings}</span>
                  {selectedBuildings.length === 0 && <Check size={12} />}
                </button>

                <div className="my-1 border-t border-[var(--rule-faint)]" />

                {/* Multi-Select Building Checkboxes */}
                {buildingsList.map((b) => {
                  const isChecked = selectedBuildings.includes(b);
                  return (
                    <button
                      key={b}
                      onClick={() => onToggleBuilding(b)}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[var(--panel-hover)] transition-colors cursor-pointer ${
                        isChecked
                          ? 'text-accent-linux font-medium bg-accent-linux/5'
                          : 'text-[var(--ink-2)]'
                      }`}
                    >
                      <span>{b}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-accent-linux border-accent-linux text-white'
                            : 'border-[var(--ink-3)]'
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Search Input Box */}
          <div className="hidden sm:block relative shrink-0 w-32 sm:w-36 md:w-44">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="panel w-full pl-7 pr-6 py-1 text-xs font-mono text-[var(--ink)] placeholder-[var(--ink-3)] focus:outline-none focus:border-accent-linux transition-colors min-h-[32px]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Mobile Search Icon Button (Small square button on mobile) */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className={`sm:hidden panel p-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center justify-center min-h-[32px] min-w-[32px] shrink-0 cursor-pointer ${
              searchQuery ? 'border-accent-linux text-accent-linux' : ''
            }`}
          >
            <Search size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
