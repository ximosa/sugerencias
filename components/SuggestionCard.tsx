interface SuggestionCardProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
}

export const SuggestionCard = ({ suggestion, onClick }: SuggestionCardProps) => {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className="suggestion-card"
    >
      <p className="suggestion-card__text">
        {suggestion}
      </p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="suggestion-card__icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7l5 5-5 5M6 12h12"
        />
      </svg>
    </button>
  );
};
