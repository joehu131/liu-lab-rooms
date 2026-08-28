'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, RotateCcw, Check } from 'lucide-react';
import { formatStockholmDate, formatStockholmTime } from '@/lib/formatters';
import { parseStockholmDateTime } from '@/lib/timeedit';
import { Language, translations } from '@/lib/i18n';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTimeMs: number;
  simulatedTimeMs: number | null;
  onApplySimulation: (targetTimeMs: number | null) => void;
  lang?: Language;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  currentTimeMs,
  simulatedTimeMs,
  onApplySimulation,
  lang = 'sv',
}) => {
  const t = translations[lang];
  const isEn = lang === 'en';

  const LIU_PASS_PRESETS = [
    { label: isEn ? '08:15 (Slot 1)' : '08:15 (Pass 1)', time: '08:15', endTime: '10:00' },
    { label: isEn ? '10:15 (Slot 2)' : '10:15 (Pass 2)', time: '10:15', endTime: '12:00' },
    { label: isEn ? '12:15 (Lunch)' : '12:15 (Lunch)', time: '12:15', endTime: '13:15' },
    { label: isEn ? '13:15 (Slot 3)' : '13:15 (Pass 3)', time: '13:15', endTime: '15:00' },
    { label: isEn ? '15:15 (Slot 4)' : '15:15 (Pass 4)', time: '15:15', endTime: '17:00' },
    { label: isEn ? '17:15 (Evening)' : '17:15 (Kväll)', time: '17:15', endTime: '21:00' },
  ];

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

  const locale = isEn ? 'en-US' : 'sv-SE';
  const formatter = new Intl.DateTimeFormat(locale, {
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
      weekdayShort: i === 0 ? t.today : weekday.slice(0, 3),
      dayNum: `${day}/${month}`,
      isToday: dateStr === todayStr,
      epochMs: targetDate.getTime(),
    });
  }

  // Find label for current selected day
  const selectedDayOption = dayOptions.find((d) => d.dateStr === selectedDateStr);
  const selectedDayLabel = selectedDayOption
    ? selectedDayOption.isToday
      ? t.today
      : `${selectedDayOption.weekdayShort} ${selectedDayOption.dayNum}`
    : t.today;

  // Convert time "HH:MM" to minute index for range slider (0 to 1439)
  const [h, m] = selectedTimeStr.split(':').map(Number);
  const currentSliderMinutes = (isNaN(h) ? 12 : h) * 60 + (isNaN(m) ? 0 : m);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = parseInt(e.target.value, 10);
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setSelectedTimeStr(timeStr);
  };

  const handleApply = () => {
    const targetEpochMs = parseStockholmDateTime(selectedDateStr, selectedTimeStr);
    onApplySimulation(targetEpochMs);
    onClose();
  };

  const handleResetToRealtime = () => {
    onApplySimulation(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="panel-glass max-w-lg w-full p-5 sm:p-6 text-[var(--ink)] border-[var(--rule)] relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-status-sim" />
            <h2 className="font-mono text-sm font-semibold tracking-wider uppercase text-[var(--ink)]">
              {t.timeMachineTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[var(--ink-3)] mb-4">
          {t.timeMachineSub}
        </p>

        {/* Section 1: Choose Day (14 Days grid) */}
        <div className="mb-5">
          <label className="block text-xs font-mono font-medium text-[var(--ink-2)] mb-2">
            {t.selectDay}:
          </label>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {dayOptions.map((opt) => {
              const isSelected = opt.dateStr === selectedDateStr;
              return (
                <button
                  key={opt.dateStr}
                  onClick={() => setSelectedDateStr(opt.dateStr)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-mono transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-status-sim text-slate-950 font-semibold shadow-md ring-1 ring-status-sim'
                      : opt.isToday
                      ? 'bg-[var(--panel-hover)] text-[var(--ink)] border border-[var(--rule)]'
                      : 'bg-[var(--panel)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] border border-[var(--rule-faint)]'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-tight">{opt.weekdayShort}</span>
                  <span className="text-[11px] font-semibold mt-0.5">{opt.dayNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: LiU Standard Lecture Pass Quick Buttons */}
        <div className="mb-5">
          <label className="block text-xs font-mono font-medium text-[var(--ink-2)] mb-2">
            {t.lecturePasses}:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono">
            {LIU_PASS_PRESETS.map((pass) => {
              const isSelected = selectedTimeStr === pass.time;
              const [passH, passM] = pass.time.split(':').map(Number);
              const passTotalMinutes = passH * 60 + passM;
              const isPastToday = isSelectedDateToday && passTotalMinutes < currentTotalMinutes;

              return (
                <button
                  key={pass.time}
                  onClick={() => setSelectedTimeStr(pass.time)}
                  className={`px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent-linux text-white font-semibold shadow-sm'
                      : isPastToday
                      ? 'bg-[var(--panel)] text-[var(--ink-3)] border border-[var(--rule-faint)] opacity-60'
                      : 'bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--panel-hover)] border border-[var(--rule)]'
                  }`}
                >
                  <span>{pass.label}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Exact Time Slider */}
        <div className="mb-6 p-3 rounded-lg bg-[var(--panel)] border border-[var(--rule)]">
          <div className="flex items-center justify-between mb-2 font-mono">
            <span className="text-xs text-[var(--ink-2)] flex items-center gap-1.5">
              <Clock size={13} className="text-accent-linux" />
              {t.exactTime}:
            </span>
            <span className="text-sm font-semibold text-[var(--ink)] bg-[var(--panel-solid)] px-2 py-0.5 rounded border border-[var(--rule)]">
              {selectedTimeStr}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={1439}
            step={5}
            value={currentSliderMinutes}
            onChange={handleSliderChange}
            className="w-full accent-accent-linux cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-[var(--ink-3)] mt-1">
            <span>00:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>17:00</span>
            <span>23:55</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[var(--rule)]">
          {simulatedTimeMs !== null && (
            <button
              onClick={handleResetToRealtime}
              className="w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-mono text-status-warn hover:bg-status-warn/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{isEn ? 'Reset to live time' : 'Återställ till realtid'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-mono text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-status-sim text-slate-950 hover:opacity-90 transition-opacity shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{t.simulateAction(selectedDayLabel, selectedTimeStr)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
