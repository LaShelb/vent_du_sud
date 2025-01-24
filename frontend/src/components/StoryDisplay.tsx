'use client';

import { useState } from 'react';

interface Choice {
  id: number;
  text: string;
  is_custom?: boolean;
}

interface Props {
  character: {
    name: string;
    description: string;
  };
  storyText: string;
  choices: Choice[];
  onChoice: (choice: Choice) => void;
  isLoading: boolean;
  selectedChoice?: Choice;
}

export default function StoryDisplay({
  character,
  storyText,
  choices,
  onChoice,
  isLoading,
  selectedChoice,
}: Props) {
  const [customChoice, setCustomChoice] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleCustomChoice = () => {
    if (customChoice.trim()) {
      onChoice({
        id: -1, // Custom choices use negative IDs
        text: customChoice.trim(),
        is_custom: true,
      });
      setCustomChoice('');
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-4xl p-6">
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2">Your Character</h2>
        <p className="text-gray-400">
          {character.name} - {character.description}
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 min-h-[200px]">
        <div className="prose prose-invert max-w-none">
          {storyText.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {choices.length > 0 && (
            <h3 className="text-xl font-bold">What will you do?</h3>
          )}
          <div className="grid grid-cols-1 gap-4">
            {/* Predefined choices */}
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice)}
                className={`${
                  selectedChoice?.id === choice.id
                    ? 'bg-emerald-900/50 border-emerald-700'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                } backdrop-blur-sm transition-colors duration-200 p-4 rounded-lg border text-left`}
              >
                <div className="flex items-center gap-3">
                  {selectedChoice?.id === choice.id && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{choice.text}</span>
                </div>
              </button>
            ))}

            {/* Custom choice input */}
            <div className="mt-4">
              {isTyping ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customChoice}
                    onChange={(e) => setCustomChoice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomChoice();
                      }
                    }}
                    placeholder="Type your own action..."
                    className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCustomChoice}
                    disabled={!customChoice.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                  >
                    Do it
                  </button>
                  <button
                    onClick={() => {
                      setCustomChoice('');
                      setIsTyping(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsTyping(true)}
                  className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-colors duration-200 p-4 rounded-lg text-left flex items-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Or do something else...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
