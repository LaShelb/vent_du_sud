'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Character {
  name: string;
  description: string;
  image_url: string;
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
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Character</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {characters.map((character) => (
          <button
            key={character.name}
            onClick={() => onSelect(character)}
            className="group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-200 p-6 rounded-lg border border-gray-700 hover:border-gray-600 text-left transform hover:scale-105"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full bg-gray-700/50 p-4 group-hover:bg-gray-600/50 transition-colors">
                <Image
                  src={character.image_url}
                  alt={character.name}
                  width={128}
                  height={128}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {character.name}
                </h3>
                <p className="text-gray-400">{character.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
