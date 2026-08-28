'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, RotateCcw, Check } from 'lucide-react';
import { formatStockholmDate, formatStockholmTime } from '@/lib/formatters';
import { parseStockholmDateTime } from '@/lib/timeedit';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimeMs: number;
  simulatedTimeMs: number | null;
  onApplySimulation: (targetTimeMs: number | null) => void;
}

const LIU_PASS_PRESETS = [
  { label: '08:15 (Pass 1)', time: '08:15', endTime: '10:00' },
  { label: '10:15 (Pass 2)', time: '10:15', endTime: '12:00' },
  { label: '12:15 (Lunch)', time: '12:15', endTime: '13:15' },
  { label: '13:15 (Pass 3)', time: '13:15', endTime: '15:00' },
  { label: '15:15 (Pass 4)', time: '15:15', endTime: '17:00' },
  { label: '17:15 (Kväll)', time: '17:15', endTime: '21:00' },
];

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  currentTimeMs,
  simulatedTimeMs,
  onApplySimulation,
}) => {
  // Current real time in Stockholm
  const todayStr = formatStockholmDate(currentTimeMs);
  const currentTimeStr = formatStockholmTime(currentTimeMs);
  const [currH, currM] = currentTimeStr.split(':').map(Number);
  const currentTotalMinutes = (isNaN(currH) ? 0 : currH) * 60 + (isNaN(currM) ? 0 : currM);

  // Initial selected day & time
  const initialTimeMs = simulatedTimeMs ?? currentTimeMs;
  const initialDateStr = formatStockholmDate(initialTimeMs);
  const initialTimeStr = formatStockholmTime(initialTimeMs);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(initialDateStr);
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>(initialTimeStr);

  useEffect(() => {
    if (isOpen) {
      const activeMs = simulatedTimeMs ?? currentTimeMs;
      setSelectedDateStr(formatStockholmDate(activeMs));
      setSelectedTimeStr(formatStockholmTime(activeMs));
    }
  }, [isOpen, simulatedTimeMs, currentTimeMs]);

  if (!isOpen) return null;

  const isSelectedDateToday = selectedDateStr === todayStr;

  // Generate the rolling 14 days options (7x2 grid)
  const dayOptions: Array<{
    dateStr: string;
    weekdayShort: string;
    dayNum: string;
    isToday: boolean;
    epochMs: number;
  }> = [];

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });

  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);

  for (let i = 0; i < 14; i++) {
    // Increment calendar day at noon UTC to prevent DST boundary drift
    const targetDate = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay + i, 12, 0, 0));
    const dateStr = formatStockholmDate(targetDate.getTime());
    const parts = formatter.formatToParts(targetDate);
    const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';

    dayOptions.push({
      dateStr,
      weekdayShort: i === 0 ? 'Idag' : weekday.slice(0, 3),
      dayNum: `${day}/${month}`,
      isToday: dateStr === todayStr,
      epochMs: targetDate.getTime(),
    });
  }

  // Find label for current selected day
  const selectedDayOption = dayOptions.find((d) => d.dateStr === selectedDateStr);
  const selectedDayLabel = selectedDayOption
    ? selectedDayOption.isToday
      ? 'Idag'
      : `${selectedDayOption.weekdayShort} ${selectedDayOption.dayNum}`
    : 'Idag';

  // Convert time "HH:MM" to minute index for range slider (0 to 1439)
  const [h, m] = selectedTimeStr.split(':').map(Number);
  const totalMinutes = (isNaN(h) ? 12 : h) * 60 + (isNaN(m) ? 0 : m);

  // Slider bounds: On today, slider minimum is current time
  const sliderMin = isSelectedDateToday ? currentTotalMinutes : 360; // 06:00
  const sliderMax = 1320; // 22:00

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    if (dateStr === todayStr && totalMinutes < currentTotalMinutes) {
      setSelectedTimeStr(currentTimeStr);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let mins = Number(e.target.value);
    if (isSelectedDateToday && mins < currentTotalMinutes) {
      mins = currentTotalMinutes;
    }
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}`;
    setSelectedTimeStr(timeFormatted);
  };

  const handleApply = () => {
    let targetMs = parseStockholmDateTime(selectedDateStr, selectedTimeStr);
    if (isSelectedDateToday && targetMs < currentTimeMs) {
      targetMs = currentTimeMs;
    }
    onApplySimulation(targetMs);
    onClose();
  };

  const handleReset = () => {
    onApplySimulation(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="panel-glass w-full sm:max-w-md p-4 sm:p-5 border-[var(--rule)] rounded-t-2xl sm:rounded-2xl relative max-h-[90vh] overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="w-10 h-1 rounded-full bg-[var(--rule)] mx-auto mb-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-status-sim animate-pulse" />
            <h2 className="font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-[var(--ink)]">
              Framtida salstillgång
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-[var(--ink)]">
          {/* 1. Day Selector (7x2 Mini Calendar Grid) */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-[var(--ink-2)] mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-accent-linux" />
              Välj dag
            </label>

            <div className="grid grid-cols-7 gap-1 p-1 rounded-xl bg-[var(--panel-hover)] border border-[var(--rule)]">
              {dayOptions.map((opt) => {
                const isSelected = selectedDateStr === opt.dateStr;
                return (
                  <button
                    key={opt.dateStr}
                    type="button"
                    onClick={() => handleSelectDay(opt.dateStr)}
                    className={`p-1.5 rounded-md text-center transition-all flex flex-col items-center justify-center min-h-[36px] touch-manipulation ${
                      isSelected
                        ? 'border border-accent-linux bg-accent-linux text-white font-semibold shadow-sm'
                        : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] border border-transparent'
                    }`}
                  >
                    <span className="font-mono text-[9px] uppercase leading-tight">
                      {opt.weekdayShort}
                    </span>
                    <span className="font-mono text-[11px] leading-tight mt-0.5">
                      {opt.dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Quick LiU Lecture Passes */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-[var(--ink-2)] mb-1">
              Lektionspass
            </label>
            <div className="grid grid-cols-3 gap-1">
              {LIU_PASS_PRESETS.map((preset) => {
                const isSelected = selectedTimeStr === preset.time;
                const [endH, endM] = preset.endTime.split(':').map(Number);
                const passEndMins = endH * 60 + endM;

                // Pass is only disabled if its END time has already passed today
                const isPast = isSelectedDateToday && passEndMins <= currentTotalMinutes;

                return (
                  <button
                    key={preset.time}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedTimeStr(preset.time)}
                    className={`panel px-2 py-1 rounded-md text-[11px] font-mono text-center transition-all min-h-[32px] touch-manipulation ${
                      isPast
                        ? 'opacity-30 cursor-not-allowed text-[var(--ink-3)] bg-transparent border-[var(--rule)]/40 line-through'
                        : isSelected
                        ? 'border-status-sim bg-status-sim/15 text-status-sim font-semibold'
                        : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Time Slider & Readout */}
          <div className="p-2.5 rounded-lg bg-[var(--panel-hover)] border border-[var(--rule)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-[var(--ink-2)]">Exakt Klockslag:</span>
              <span className="font-mono text-lg font-semibold text-status-sim tracking-tight">
                {selectedTimeStr}
              </span>
            </div>

            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={5}
              value={Math.max(sliderMin, totalMinutes)}
              onChange={handleSliderChange}
              className="w-full h-1 rounded-lg bg-[var(--rule)] accent-status-sim cursor-pointer touch-manipulation"
            />
            <div className="flex justify-between text-[9px] font-mono text-[var(--ink-3)] mt-0.5">
              <span>{isSelectedDateToday ? currentTimeStr : '06:00'}</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>17:00</span>
              <span>22:00</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="panel px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors min-h-[36px]"
          >
            <RotateCcw size={12} />
            <span>Realtid</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 panel px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-accent-linux text-white hover:bg-accent-linux/90 flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[36px]"
          >
            <Check size={13} />
            <span>Simulera {selectedDayLabel} {selectedTimeStr}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
