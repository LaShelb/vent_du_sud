'use client';

import { useState } from 'react';
import CharacterSelection from '@/components/CharacterSelection';
import StorySlider from '@/components/StorySlider';

export default function Home() {
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialStory, setInitialStory] = useState<any>(null);

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
      setInitialStory(data);
    } catch (error) {
      console.error('Error starting story:', error);
    } finally {
      setIsLoading(false);
    }
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
          story_context: choice.storyText,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error continuing story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
          Interactive Story Adventure
        </h1>
        
        <div className="flex justify-center">
          {!character ? (
            <CharacterSelection onSelect={handleCharacterSelect} />
          ) : (
            <StorySlider
              character={character}
              onChoice={handleChoice}
              isLoading={isLoading}
              initialStory={initialStory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
