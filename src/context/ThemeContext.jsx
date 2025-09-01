import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

// This function will apply the correct class to the root element
const applyTheme = (theme) => {
  const root = window.document.documentElement;
  
  // Clean up old theme classes
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    // If system is selected, check the OS preference and apply it
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    // Otherwise, apply the selected theme directly
    root.classList.add(theme);
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    applyTheme(theme);

    // This listener will automatically update the theme if the user
    // changes their system preference while the app is open.
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup the listener when the component unmounts
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

export const useTheme = () => useContext(ThemeContext);

