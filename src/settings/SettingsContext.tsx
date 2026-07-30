import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'it' | 'en' | 'es' | 'fr' | 'de';

export type ThemePreset = {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
};

export const THEMES: ThemePreset[] = [
  { id: 'emerald', name: 'Smeraldo', primary: '#10b981', primaryDark: '#059669', primaryLight: '#34d399', primarySoft: '#ecfdf5' },
  { id: 'blue', name: 'Blu', primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#60a5fa', primarySoft: '#eff6ff' },
  { id: 'teal', name: 'Verde acqua', primary: '#14b8a6', primaryDark: '#0d9488', primaryLight: '#2dd4bf', primarySoft: '#f0fdfa' },
  { id: 'rose', name: 'Rosa', primary: '#f43f5e', primaryDark: '#e11d48', primaryLight: '#fb7185', primarySoft: '#fff1f2' },
  { id: 'amber', name: 'Ambra', primary: '#f59e0b', primaryDark: '#d97706', primaryLight: '#fbbf24', primarySoft: '#fffbeb' },
  { id: 'violet', name: 'Viola', primary: '#8b5cf6', primaryDark: '#7c3aed', primaryLight: '#a78bfa', primarySoft: '#f5f3ff' },
  { id: 'slate', name: 'Grigio', primary: '#475569', primaryDark: '#334155', primaryLight: '#64748b', primarySoft: '#f8fafc' },
];

export type Settings = {
  language: Language;
  age: number;
  themeId: string;
  autoHighlight: boolean;
  manualHighlight: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  language: 'it',
  age: 16,
  themeId: 'emerald',
  autoHighlight: true,
  manualHighlight: true,
};

const STORAGE_KEY = 'app-settings';

type SettingsContextValue = {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  theme: ThemePreset;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const theme = THEMES.find((t) => t.id === settings.themeId) ?? THEMES[0];

  const update: SettingsContextValue['update'] = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, update, theme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
