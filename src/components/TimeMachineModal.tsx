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

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeMs = simulatedTimeMs ?? currentTimeMs;
      setSelectedDateStr(formatStockholmDate(activeMs));
      setSelectedTimeStr(formatStockholmTime(activeMs));
    }
  }, [isOpen, simulatedTimeMs, currentTimeMs]);

  if (!isOpen) return null;

  // Generate 14-day calendar window (DST safe calendar day arithmetic)
  const fourteenDays: { dateStr: string; weekday: string; shortDate: string; isToday: boolean; isTomorrow: boolean }[] = [];
  const [baseY, baseM, baseD] = todayStr.split('-').map(Number);

  for (let i = 0; i < 14; i++) {
    const calendarUtc = new Date(Date.UTC(baseY, baseM - 1, baseD + i, 12, 0, 0));
    const dateStr = formatStockholmDate(calendarUtc.getTime());

    const formatter = new Intl.DateTimeFormat(isEn ? 'en-US' : 'sv-SE', {
      timeZone: 'Europe/Stockholm',
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    });
    const parts = formatter.formatToParts(calendarUtc);
    const weekday = parts.find((p) => p.type === 'weekday')?.value?.slice(0, 3).toUpperCase() || '';
    const dayVal = parts.find((p) => p.type === 'day')?.value || '';
    const monthVal = parts.find((p) => p.type === 'month')?.value || '';

    fourteenDays.push({
      dateStr,
      weekday,
      shortDate: `${dayVal}/${monthVal}`,
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }

  // Time Slider logic (07:00 to 21:00 = 420 to 1260 minutes)
  const [selH, selM] = selectedTimeStr.split(':').map(Number);
  const selectedTotalMinutes = (isNaN(selH) ? 8 : selH) * 60 + (isNaN(selM) ? 15 : selM);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMinutes = Number(e.target.value);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setSelectedTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const isTodaySelected = selectedDateStr === todayStr;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-machine-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="panel-glass max-w-lg w-full p-5 sm:p-6 text-[var(--ink)] border-[var(--rule)] relative max-h-[92vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-status-sim" />
            <h2 id="time-machine-title" className="font-mono text-sm font-semibold tracking-wider uppercase text-[var(--ink)]">
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

        <p className="text-xs text-[var(--ink-3)] mb-4 font-mono">
          {t.timeMachineSub}
        </p>

        {/* Section 1: Choose Day (14 Days grid) */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-[var(--ink)] mb-2 font-mono flex items-center justify-between">
            <span>1. {t.selectDay}</span>
            <span className="text-[var(--ink-3)] font-normal">
              {selectedDateStr}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 font-mono">
            {fourteenDays.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`p-1.5 rounded flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-status-sim text-white font-semibold shadow-md ring-1 ring-white/20'
                      : 'panel hover:bg-[var(--panel-hover)] text-[var(--ink-2)]'
                  }`}
                >
                  <span className="text-[9px] uppercase text-[var(--ink-3)]">
                    {day.isToday ? t.today : day.isTomorrow ? t.tomorrow : day.weekday}
                  </span>
                  <span className="text-xs font-semibold mt-0.5">
                    {day.shortDate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: LiU Lecture Passes Presets */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-[var(--ink)] mb-2 font-mono flex items-center justify-between">
            <span>2. {t.lecturePasses}</span>
            <span className="text-[var(--ink-3)] font-normal text-[11px]">
              {selectedTimeStr}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-xs">
            {LIU_PASS_PRESETS.map((pass) => {
              const isSelected = selectedTimeStr === pass.time;
              return (
                <button
                  key={pass.time}
                  onClick={() => setSelectedTimeStr(pass.time)}
                  className={`p-2 rounded text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-status-sim/20 border border-status-sim text-status-sim font-semibold'
                      : 'panel hover:bg-[var(--panel-hover)] text-[var(--ink-2)]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[var(--ink)]">{pass.label}</div>
                  <div className="text-[10px] text-[var(--ink-3)] mt-0.5">{pass.time} – {pass.endTime}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Exact Time Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink)] mb-2 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-status-sim" />
              <span>3. {t.exactTime}</span>
            </span>
            <span className="text-sm font-mono text-status-sim font-bold px-2 py-0.5 rounded bg-status-sim/10">
              {selectedTimeStr}
            </span>
          </div>

          <input
            type="range"
            min={420} // 07:00
            max={1260} // 21:00
            step={15} // 15-minute LiU quarter steps
            value={selectedTotalMinutes}
            onChange={handleSliderChange}
            className="w-full h-2 bg-[var(--rule)] rounded-lg appearance-none cursor-pointer accent-status-sim"
          />

          <div className="flex justify-between text-[10px] font-mono text-[var(--ink-3)] mt-1">
            <span>07:00</span>
            <span>12:00</span>
            <span>17:00</span>
            <span>21:00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--rule)] font-mono text-xs">
          {simulatedTimeMs !== null ? (
            <button
              onClick={handleResetToRealtime}
              title={t.resetLiveTitle}
              className="panel px-3 py-2 text-[var(--ink-3)] hover:text-white hover:border-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{t.resetLive}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="panel px-3 py-2 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-status-sim hover:bg-status-sim/90 text-white font-semibold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check size={14} />
              <span>
                {t.simulateAction(
                  isTodaySelected ? t.today : selectedDateStr,
                  selectedTimeStr
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
