import React from 'react';
import { motion } from 'framer-motion';
import { Theme } from '../types';

interface CatToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const CatToggle: React.FC<CatToggleProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cat-accent"
      aria-label="Toggle Theme"
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center overflow-hidden"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-4 h-4 transition-colors duration-300 ${isDark ? 'text-yellow-400' : 'text-gray-800'}`}
        >
          {/* Cat Head Outline */}
          <path d="M12 5C8 5 5 8 5 12V19H19V12C19 8 16 5 12 5Z" fill="none" className="opacity-0" /> 
          
          {/* Ears */}
          <path d="M6 8L4 3L9 5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 8L20 3L15 5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Face Expression - Changes based on theme */}
          {isDark ? (
             // Sleeping eyes (Dark mode)
             <>
                <path d="M8 13C8 13 9 14 10 13" strokeLinecap="round" />
                <path d="M14 13C14 13 15 14 16 13" strokeLinecap="round" />
             </>
          ) : (
             // Awake eyes (Light mode)
             <>
                <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
             </>
          )}
          
          {/* Nose/Mouth */}
          <path d="M12 15V16M11 17H13" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      </motion.div>
    </button>
  );
};
