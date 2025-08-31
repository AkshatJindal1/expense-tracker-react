
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between"
    >
      <div className="flex items-center">
        <span className="material-symbols-outlined mr-3">
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
        <span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>
      <div className="relative">
        <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`}></div>
      </div>
    </button>
  );
};
