import React from 'react';
import { Aperture, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme }) => {
  return (
    <header className="w-full py-5 px-6 sticky top-0 z-50 transition-all duration-300">
      {/* Floating Glass Header */}
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-500">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-white/10 backdrop-blur-md border border-blue-500/10 dark:border-white/10 transition-colors duration-500">
            <Aperture className="w-5 h-5 text-blue-600 dark:text-white transition-colors duration-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">
              Vision Air
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 transition-all duration-300 text-gray-600 dark:text-white/80 active:scale-90 focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            <div className="relative w-5 h-5">
              <Sun className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
              <Moon className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;