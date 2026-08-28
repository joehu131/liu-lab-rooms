'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Info, RefreshCw } from 'lucide-react';
import { InfoModal } from './InfoModal';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, lastUpdated }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem('liu-labs-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('liu-labs-theme', nextTheme);
  };

  return (
    <>
      <header className="w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 pb-2 flex items-center justify-between">
        {/* Left: Network Badge */}
        <div className="panel inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--panel)] border-[var(--rule)]">
          <span className="w-2 h-2 rounded-full bg-accent-linux shadow-[0_0_8px_var(--accent-linux)]" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[var(--ink)]">
            LiU Labbsalar
          </span>
          <span className="text-xs text-[var(--ink-3)] border-l border-[var(--rule)] pl-2 font-mono hidden sm:inline">
            CAMPUS VALLA
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh schedule"
              aria-label="Refresh schedule"
              className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] justify-center"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-accent-linux' : ''} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors min-h-[36px] min-w-[36px] justify-center"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={() => setIsInfoOpen(true)}
            title="About and information"
            aria-label="About and information"
            className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors min-h-[36px] min-w-[36px] justify-center"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
};
