'use client';

import { useState, useEffect } from 'react';

interface Character {
  name: string;
  description: string;
}

interface Props {
  onSelect: (character: Character) => void;
  language: string;
}

export default function CharacterSelection({ onSelect, language }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`http://localhost:8000/characters/${language}`);
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [language]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Character</h2>
      <div className="grid grid-cols-1 gap-4">
        {characters.map((character) => (
          <button
            key={character.name}
            onClick={() => onSelect(character)}
            className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-200 p-6 rounded-lg border border-gray-700 hover:border-gray-600 text-left"
          >
            <div className="text-lg font-semibold">{character.name}</div>
            <div className="text-sm text-gray-400">{character.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
