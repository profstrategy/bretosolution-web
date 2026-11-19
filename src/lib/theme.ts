"use client";

import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'breto-theme';
const THEME_EVENT = 'breto-theme-change';

function getSystemTheme(): ThemeMode {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore storage access errors
  }
  return getSystemTheme();
}

export function applyThemeToDom(mode: ThemeMode): void {
  try {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch {
    // Ignore DOM access errors
  }
}

export function setStoredTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage write errors
  }
  applyThemeToDom(mode);
  try {
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT, { detail: mode }));
  } catch {
    // Ignore event dispatch errors
  }
}

export function useTheme(): { theme: ThemeMode; toggle: () => void } {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const initial = getStoredTheme();
    setTheme(initial);
    applyThemeToDom(initial);

    const handleThemeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeMode>;
      if (customEvent.detail === 'light' || customEvent.detail === 'dark') {
        setTheme(customEvent.detail);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const next = getStoredTheme();
        setTheme(next);
        applyThemeToDom(next);
      }
    };

    try {
      window.addEventListener(THEME_EVENT, handleThemeEvent);
      window.addEventListener('storage', handleStorage);
    } catch {
      // Ignore listener errors
    }

    return () => {
      try {
        window.removeEventListener(THEME_EVENT, handleThemeEvent);
        window.removeEventListener('storage', handleStorage);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      setStoredTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
