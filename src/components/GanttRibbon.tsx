'use client';

import React from 'react';
import { GanttSegment } from '@/types';

interface GanttRibbonProps {
  segments: GanttSegment[];
  currentHour?: number; // 8.0 to 20.0
}

export const GanttRibbon: React.FC<GanttRibbonProps> = ({ segments, currentHour }) => {
  return (
    <div className="w-full mt-2.5 pt-2 border-t border-[var(--rule)]">
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-3)] mb-1">
        <span>08:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>17:00</span>
        <span>20:00</span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2.5 w-full rounded bg-[var(--panel-hover)] border border-[var(--rule)] overflow-hidden flex">
        {segments.map((seg, i) => {
          const widthPercent = Math.max(0, ((seg.endHour - seg.startHour) / 12) * 100);

          return (
            <div
              key={i}
              style={{ width: `${widthPercent}%` }}
              title={
                seg.isOccupied
                  ? `Booked (${seg.courseCode || 'Busy'})`
                  : 'Available'
              }
              className={`h-full transition-colors ${
                seg.isOccupied
                  ? 'bg-status-busy/70 border-r border-background/40'
                  : 'bg-status-free/30 hover:bg-status-free/50'
              }`}
            />
          );
        })}

        {/* Current Time Needle */}
        {currentHour !== undefined && currentHour >= 8 && currentHour <= 20 && (
          <div
            style={{ left: `${((currentHour - 8) / 12) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] z-10 -translate-x-1/2"
            title={`Current: ${Math.floor(currentHour)}:${String(Math.floor((currentHour % 1) * 60)).padStart(2, '0')}`}
          />
        )}
      </div>
    </div>
  );
};
