'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateSettings } = useSettingsStore();
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Read from localStorage or DOM class
    const isDarkInDOM = document.documentElement.classList.contains('dark');
    const savedTheme = (localStorage.getItem('meraj_os_theme') as 'light' | 'dark') || (isDarkInDOM ? 'dark' : 'light');
    setThemeState(savedTheme);
    applyThemeToDOM(savedTheme);
  }, []);

  const applyThemeToDOM = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('meraj_os_theme', newTheme);
    updateSettings({ theme: newTheme });
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
