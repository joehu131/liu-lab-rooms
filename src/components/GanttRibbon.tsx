'use client';

import React from 'react';
import { GanttSegment } from '@/types';

interface GanttRibbonProps {
  segments: GanttSegment[];
  currentHour?: number; // 7.0 to 21.0
}

const LIU_PASSES = [
  { label: '08:00', hour: 8.0 },
  { label: '10:00', hour: 10.0 },
  { label: '12:00', hour: 12.0 },
  { label: '13:00', hour: 13.0 },
  { label: '15:00', hour: 15.0 },
  { label: '17:00', hour: 17.0 },
  { label: '19:00', hour: 19.0 },
];

export const GanttRibbon: React.FC<GanttRibbonProps> = ({ segments, currentHour }) => {
  return (
    <div className="w-full mt-2 select-none">
      {/* LiU Hourly Event Ticks (Exact Geometric Coordinates) */}
      <div className="relative w-full h-3.5 text-[9px] sm:text-[10px] font-mono text-[var(--ink-3)] mb-1">
        {LIU_PASSES.map((pass) => {
          const leftPercent = ((pass.hour - 7) / 14) * 100;
          return (
            <span
              key={pass.label}
              style={{ left: `${leftPercent}%` }}
              className="absolute -translate-x-1/2 whitespace-nowrap"
            >
              {pass.label}
            </span>
          );
        })}
      </div>

      {/* Progress Bar Container (07:00 to 21:00 Span) */}
      <div className="relative h-2.5 w-full rounded bg-[var(--panel-solid)] border border-[var(--rule)] overflow-hidden flex">
        {/* Subtle Vertical Pass Markers */}
        {LIU_PASSES.map((pass) => (
          <div
            key={pass.label}
            style={{ left: `${((pass.hour - 7) / 14) * 100}%` }}
            className="absolute top-0 bottom-0 w-[1px] bg-[var(--rule-faint)] pointer-events-none z-0"
          />
        ))}

        {/* Occupied / Free Segments */}
        {segments.map((seg, i) => {
          const widthPercent = Math.max(0, ((seg.endHour - seg.startHour) / 14) * 100);

          return (
            <div
              key={i}
              style={{ width: `${widthPercent}%` }}
              title={
                seg.isOccupied
                  ? `Bokat (${seg.courseCode || 'Upptagen'})`
                  : 'Ledigt'
              }
              className={`h-full relative z-0 transition-colors ${
                seg.isOccupied
                  ? 'bg-status-busy'
                  : 'bg-transparent'
              }`}
            />
          );
        })}

        {/* Real-time / Simulated Time Needle */}
        {currentHour !== undefined && currentHour >= 7 && currentHour <= 21 && (
          <div
            style={{ left: `${((currentHour - 7) / 14) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] z-10 -translate-x-1/2 pointer-events-none"
            title={`Tid: ${Math.floor(currentHour)}:${String(Math.floor((currentHour % 1) * 60)).padStart(2, '0')}`}
          />
        )}
      </div>
    </div>
  );
};
