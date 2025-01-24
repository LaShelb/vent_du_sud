'use client';

import { useState, useRef, useEffect } from 'react';
import StoryDisplay from './StoryDisplay';

interface StoryStep {
  character?: {
    name: string;
    description: string;
  };
  storyText: string;
  choices: Array<{
    id: number;
    text: string;
  }>;
  selectedChoice?: {
    id: number;
    text: string;
  };
}

interface Props {
  character: {
    name: string;
    description: string;
  };
  onChoice: (choice: any) => Promise<any>;
  isLoading: boolean;
  initialStory: {
    story_text: string;
    choices: Array<{
      id: number;
      text: string;
    }>;
  };
}

export default function StorySlider({ character, onChoice, isLoading, initialStory }: Props) {
  const [storySteps, setStorySteps] = useState<StoryStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialStory) {
      setStorySteps([
        {
          character,
          storyText: initialStory.story_text,
          choices: initialStory.choices,
        },
      ]);
    }
  }, [initialStory, character]);

  const handleChoice = async (choice: any) => {
    // Save the current choice
    const updatedSteps = [...storySteps];
    updatedSteps[currentStep] = {
      ...updatedSteps[currentStep],
      selectedChoice: choice,
    };
    setStorySteps(updatedSteps);

    // Get the next story part
    const nextStory = await onChoice({
      ...choice,
      storyText: storySteps[currentStep].storyText,
    });

    if (nextStory) {
      setStorySteps((prev) => [
        ...prev,
        {
          storyText: nextStory.story_text,
          choices: nextStory.choices,
        },
      ]);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const navigateStep = (direction: 'prev' | 'next') => {
    const newStep = direction === 'prev' ? currentStep - 1 : currentStep + 1;
    if (newStep >= 0 && newStep < storySteps.length) {
      setCurrentStep(newStep);
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translateX(-${newStep * 100}%)`;
      }
    }
  };

  if (storySteps.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
      {/* Navigation Arrows */}
      {currentStep > 0 && (
        <button
          onClick={() => navigateStep('prev')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-full transition-colors"
          aria-label="Previous step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      {currentStep < storySteps.length - 1 && (
        <button
          onClick={() => navigateStep('next')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-full transition-colors"
          aria-label="Next step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Story Steps Slider */}
      <div
        ref={sliderRef}
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentStep * 100}%)` }}
      >
        {storySteps.map((step, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            style={{ minWidth: '100%' }}
          >
            <StoryDisplay
              character={character}
              storyText={step.storyText}
              choices={currentStep === index ? step.choices : []}
              onChoice={handleChoice}
              isLoading={isLoading && currentStep === index}
              selectedChoice={step.selectedChoice}
            />
          </div>
        ))}
      </div>

      {/* Step Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {storySteps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-emerald-400'
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            onClick={() => {
              setCurrentStep(index);
              if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${index * 100}%)`;
              }
            }}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
