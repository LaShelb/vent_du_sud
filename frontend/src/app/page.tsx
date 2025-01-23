'use client';

import { useState } from 'react';
import CharacterSelection from '@/components/CharacterSelection';
import StoryDisplay from '@/components/StoryDisplay';

export default function Home() {
  const [character, setCharacter] = useState<any>(null);
  const [storyText, setStoryText] = useState<string>('');
  const [choices, setChoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCharacterSelect = async (selectedCharacter: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/start-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCharacter),
      });
      const data = await response.json();
      setCharacter(selectedCharacter);
      setStoryText(data.story_text);
      setChoices(data.choices);
    } catch (error) {
      console.error('Error starting story:', error);
    }
    setIsLoading(false);
  };

  const handleChoice = async (choice: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/continue-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          choice_id: choice.id,
          choice_text: choice.text,
          story_context: storyText,
        }),
      });
      const data = await response.json();
      setStoryText(data.story_text);
      setChoices(data.choices);
    } catch (error) {
      console.error('Error continuing story:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
          Interactive Story Adventur
        </h1>
        
        <div className="flex justify-center">
          {!character ? (
            <CharacterSelection onSelect={handleCharacterSelect} />
          ) : (
            <StoryDisplay
              character={character}
              storyText={storyText}
              choices={choices}
              onChoice={handleChoice}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
