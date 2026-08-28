'use client';

import { useState, useEffect, useCallback } from 'react';
import { ALL_BUILDINGS } from '@/data/rooms';
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

const VALID_BUILDINGS_SET: Set<string> = new Set(ALL_BUILDINGS.filter((b) => b !== 'All'));

/**
 * Validate and sanitize parsed preferences object
 */
export function sanitizePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_PREFERENCES };
  }

  const obj = raw as Record<string, unknown>;

  const theme = obj.theme === 'light' || obj.theme === 'dark' ? obj.theme : DEFAULT_PREFERENCES.theme;
  const lang = obj.lang === 'en' || obj.lang === 'sv' ? obj.lang : DEFAULT_PREFERENCES.lang;
  const selectedOs =
    obj.selectedOs === 'linux' || obj.selectedOs === 'windows' || obj.selectedOs === 'all'
      ? obj.selectedOs
      : DEFAULT_PREFERENCES.selectedOs;

  // Deduplicate and ensure only valid campus buildings are accepted
  const selectedBuildings = Array.isArray(obj.selectedBuildings)
    ? Array.from(new Set(obj.selectedBuildings.filter((b): b is string => typeof b === 'string' && VALID_BUILDINGS_SET.has(b))))
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

  // 1. Load saved preferences on client mount (with legacy migration support)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = sanitizePreferences(parsed);
        setPreferences(validated);
      } else {
        // Check for legacy single-item keys for seamless upgrade
        const legacyTheme = localStorage.getItem('liu-labs-theme') as 'dark' | 'light' | null;
        const legacyLang = localStorage.getItem('liu-labs-lang') as Language | null;

        const initialTheme = legacyTheme === 'dark' || legacyTheme === 'light' ? legacyTheme : DEFAULT_PREFERENCES.theme;
        const initialLang = legacyLang === 'sv' || legacyLang === 'en' ? legacyLang : DEFAULT_PREFERENCES.lang;

        const initialPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          theme: initialTheme,
          lang: initialLang,
        };

        setPreferences(initialPrefs);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPrefs));
        } catch {
          // Ignore write error
        }
      }
    } catch {
      // Ignore localStorage read errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Synchronize DOM side-effects in a dedicated effect
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
      document.documentElement.setAttribute('lang', preferences.lang);
    }
  }, [preferences.theme, preferences.lang, isLoaded]);

  // 3. Save to localStorage whenever preferences change (after loaded)
  const updatePreferences = useCallback((updater: (prev: UserPreferences) => UserPreferences) => {
    setPreferences((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore write errors (e.g. private browsing quota)
      }
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    updatePreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, [updatePreferences]);

  const toggleLang = useCallback(() => {
    updatePreferences((prev) => ({
      ...prev,
      lang: prev.lang === 'sv' ? 'en' : 'sv',
    }));
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

  const resetFilters = useCallback(() => {
    updatePreferences((prev) => ({
      ...prev,
      selectedOs: 'all',
      selectedBuildings: [],
      showOnlyAvailable: false,
    }));
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
    resetFilters,
  };
}
