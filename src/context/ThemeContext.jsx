import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

// This helper function applies the correct class to the root <html> element
const applyThemePreference = (theme) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    applyThemePreference(theme);

    // This listener handles the case where a user changes their OS theme
    // while the app is open and the setting is 'system'.
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyThemePreference('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * A custom hook to access the theme state.
 * @returns {{
 * theme: 'light' | 'dark' | 'system',
 * setTheme: (theme: 'light' | 'dark' | 'system') => void,
 * resolvedTheme: 'light' | 'dark'
 * }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, setTheme } = context;

  // This state will hold the actual theme ('light' or 'dark')
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const resolveAndSetTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveAndSetTheme(); // Set on initial render and when theme preference changes

    // Also listen for OS theme changes to update the resolved theme in real-time
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', resolveAndSetTheme);
    return () => mediaQuery.removeEventListener('change', resolveAndSetTheme);

  }, [theme]);

  return { theme, setTheme, resolvedTheme };
};

