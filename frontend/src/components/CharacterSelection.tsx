'use client';

import { useState, useEffect } from 'react';

interface Character {
  name: string;
  description: string;
}

interface Props {
  onSelect: (character: Character) => void;
}

export default function CharacterSelection({ onSelect }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('http://localhost:8000/characters');
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
      setIsLoading(false);
    };

    fetchCharacters();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {characters.map((character) => (
        <button
          key={character.name}
          onClick={() => onSelect(character)}
          className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-200 p-6 rounded-lg border border-gray-700 hover:border-gray-600"
        >
          <h2 className="text-xl font-bold mb-2">{character.name}</h2>
          <p className="text-gray-400">{character.description}</p>
        </button>
      ))}
    </div>
  );
}
