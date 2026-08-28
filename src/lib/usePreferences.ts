'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language } from './i18n';

export interface UserPreferences {
  theme: 'dark' | 'light';
  lang: Language;
  selectedOs: 'all' | 'linux' | 'windows';
  selectedBuildings: string[];
  showOnlyAvailable: boolean;
}

const STORAGE_KEY = 'liu-labs-preferences-v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  lang: 'sv',
  selectedOs: 'all',
  selectedBuildings: [],
  showOnlyAvailable: false,
};

/**
 * Validate and sanitize parsed preferences object
 */
export function sanitizePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PREFERENCES };
  }

  const obj = raw as Record<string, unknown>;

  const theme = obj.theme === 'light' || obj.theme === 'dark' ? obj.theme : DEFAULT_PREFERENCES.theme;
  const lang = obj.lang === 'en' || obj.lang === 'sv' ? obj.lang : DEFAULT_PREFERENCES.lang;
  const selectedOs =
    obj.selectedOs === 'linux' || obj.selectedOs === 'windows' || obj.selectedOs === 'all'
      ? obj.selectedOs
      : DEFAULT_PREFERENCES.selectedOs;
  const selectedBuildings = Array.isArray(obj.selectedBuildings)
    ? obj.selectedBuildings.filter((b): b is string => typeof b === 'string' && b !== 'All')
    : DEFAULT_PREFERENCES.selectedBuildings;
  const showOnlyAvailable = typeof obj.showOnlyAvailable === 'boolean' ? obj.showOnlyAvailable : false;

  return {
    theme,
    lang,
    selectedOs,
    selectedBuildings,
    showOnlyAvailable,
  };
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = sanitizePreferences(parsed);
        setPreferences(validated);
        document.documentElement.setAttribute('data-theme', validated.theme);
        document.documentElement.setAttribute('lang', validated.lang);
      } else {
        // Default standard theme is light mode for new users
        setPreferences(DEFAULT_PREFERENCES);
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.setAttribute('lang', 'sv');
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever preferences change (once loaded)
  const updatePreferences = useCallback((updater: (prev: UserPreferences) => UserPreferences) => {
    setPreferences((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore write errors (e.g. private mode quota)
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    updatePreferences((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { ...prev, theme: nextTheme };
    });
  }, [updatePreferences]);

  const toggleLang = useCallback(() => {
    updatePreferences((prev) => {
      const nextLang: Language = prev.lang === 'sv' ? 'en' : 'sv';
      document.documentElement.setAttribute('lang', nextLang);
      return { ...prev, lang: nextLang };
    });
  }, [updatePreferences]);

  const setSelectedOs = useCallback(
    (os: 'all' | 'linux' | 'windows') => {
      updatePreferences((prev) => ({ ...prev, selectedOs: os }));
    },
    [updatePreferences]
  );

  const toggleBuilding = useCallback(
    (building: string) => {
      updatePreferences((prev) => {
        const exists = prev.selectedBuildings.includes(building);
        const nextBuildings = exists
          ? prev.selectedBuildings.filter((b) => b !== building)
          : [...prev.selectedBuildings, building];
        return { ...prev, selectedBuildings: nextBuildings };
      });
    },
    [updatePreferences]
  );

  const clearBuildings = useCallback(() => {
    updatePreferences((prev) => ({ ...prev, selectedBuildings: [] }));
  }, [updatePreferences]);

  const toggleShowOnlyAvailable = useCallback(() => {
    updatePreferences((prev) => ({ ...prev, showOnlyAvailable: !prev.showOnlyAvailable }));
  }, [updatePreferences]);

  return {
    preferences,
    isLoaded,
    toggleTheme,
    toggleLang,
    setSelectedOs,
    toggleBuilding,
    clearBuildings,
    toggleShowOnlyAvailable,
  };
}
