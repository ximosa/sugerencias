import React from 'react';

interface SuggestionCardProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onClick }) => {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className="w-full text-left p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-600/70 group transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <p className="text-gray-700 dark:text-gray-200 group-hover:text-indigo-800 dark:group-hover:text-white font-medium">
          {suggestion}
        </p>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
        </svg>
      </div>
    </button>
  );
};

export default SuggestionCard;