'use client';

import React, { useState } from 'react';
import { Sun, Moon, Info, RefreshCw } from 'lucide-react';
import { InfoModal } from './InfoModal';
import { Language, translations } from '@/lib/i18n';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: number;
  lang: Language;
  onToggleLang: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  lastUpdated,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const t = translations[lang];

  return (
    <>
      <header className="w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 pb-2 flex items-center justify-between">
        {/* Left: Network Badge */}
        <div className="panel inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--panel)] border-[var(--rule)]">
          <span className="font-mono text-xs font-semibold tracking-wider text-[var(--ink)]">
            {t.appTitle}
          </span>
          <span className="text-xs text-[var(--ink-3)] border-l border-[var(--rule)] pl-2 font-mono hidden sm:inline">
            {t.campusValla}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title={t.refreshSchedule}
              aria-label={t.refreshSchedule}
              className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] justify-center cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-accent-linux' : ''} />
            </button>
          )}

          {/* Language Switch Button: Shows ENG when Swedish, SWE when English */}
          <button
            onClick={onToggleLang}
            title={t.langToggle}
            aria-label={t.langToggle}
            className="panel px-2.5 py-1.5 text-[11px] font-mono font-semibold text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center justify-center transition-colors min-h-[36px] min-w-[38px] cursor-pointer"
          >
            {lang === 'sv' ? 'ENG' : 'SWE'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={t.themeToggle}
            aria-label={t.themeToggle}
            className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors min-h-[36px] min-w-[36px] justify-center cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setIsInfoOpen(true)}
            title={t.aboutTitle}
            aria-label={t.aboutTitle}
            className="panel px-2.5 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] flex items-center gap-1.5 transition-colors min-h-[36px] min-w-[36px] justify-center cursor-pointer"
          >
            <Info size={14} />
          </button>
        </div>
      </header>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} lang={lang} />
    </>
  );
};
