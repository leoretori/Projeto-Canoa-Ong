import { Platform } from 'react-native';

const THEME_KEY = 'vaaflow_theme';
const CONTRAST_KEY = 'vaaflow_high_contrast';
const FONT_KEY = 'vaaflow_font_scale';

export type FontScale = 'sm' | 'md' | 'lg' | 'xl';
export type ThemeMode = 'light' | 'dark';

type AccessibilityListener = () => void;
const listeners = new Set<AccessibilityListener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // safe fallback
    }
  });
}

export function subscribeAccessibility(fn: AccessibilityListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getStoredTheme(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
}

export function setStoredTheme(theme: ThemeMode) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_KEY, theme);
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    notifyListeners();
  }
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  setStoredTheme(next);
  return next;
}

export function getStoredContrast(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.localStorage.getItem(CONTRAST_KEY) === 'true';
  }
  return false;
}

export function setStoredContrast(active: boolean) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(CONTRAST_KEY, String(active));
    document.documentElement.classList.toggle('high-contrast', active);
    document.body.classList.toggle('high-contrast', active);
    notifyListeners();
  }
}

export function toggleContrast(): boolean {
  const current = getStoredContrast();
  const next = !current;
  setStoredContrast(next);
  return next;
}

export function getStoredFontScale(): FontScale {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(FONT_KEY) as FontScale | null;
    if (saved && ['sm', 'md', 'lg', 'xl'].includes(saved)) {
      return saved;
    }
  }
  return 'md';
}

export function setStoredFontScale(scale: FontScale) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const scales: FontScale[] = ['sm', 'md', 'lg', 'xl'];
    scales.forEach((s) => document.documentElement.classList.remove('font-scale-' + s));
    document.documentElement.classList.add('font-scale-' + scale);
    window.localStorage.setItem(FONT_KEY, scale);
    notifyListeners();
  }
}

/**
 * Inicialização global chamada no _layout.tsx na inicialização do app.
 */
export function initAccessibility() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const theme = getStoredTheme();
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);

    const contrast = getStoredContrast();
    document.documentElement.classList.toggle('high-contrast', contrast);
    document.body.classList.toggle('high-contrast', contrast);

    const scale = getStoredFontScale();
    const scales: FontScale[] = ['sm', 'md', 'lg', 'xl'];
    scales.forEach((s) => document.documentElement.classList.remove('font-scale-' + s));
    document.documentElement.classList.add('font-scale-' + scale);
  }
}

