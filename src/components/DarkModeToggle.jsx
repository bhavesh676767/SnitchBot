import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(isDarkMode);
    applyTheme(isDarkMode);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <button
        className={`theme-toggle-btn ${!isDark ? 'active' : ''}`}
        aria-label="Light mode"
      >
        <Sun size={18} />
      </button>
      <button
        className={`theme-toggle-btn ${isDark ? 'active' : ''}`}
        aria-label="Dark mode"
      >
        <Moon size={18} />
      </button>
    </div>
  );
};

export default DarkModeToggle;
