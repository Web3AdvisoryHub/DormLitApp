import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEME, STORAGE_KEYS } from '@/constants/config';

type Theme = typeof THEME[keyof typeof THEME];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme && Object.values(THEME).includes(storedTheme as Theme)) {
      return storedTheme as Theme;
    }
    return THEME.SYSTEM;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEME.DARK
      : THEME.LIGHT;

    const currentTheme = theme === THEME.SYSTEM ? systemTheme : theme;

    root.classList.remove(THEME.LIGHT, THEME.DARK);
    root.classList.add(currentTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 