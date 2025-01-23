'use client';

interface Choice {
  id: number;
  text: string;
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
}

export default function StoryDisplay({
  character,
  storyText,
  choices,
  onChoice,
  isLoading,
}: Props) {
  return (
    <div className="space-y-8 w-full max-w-4xl">
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-2">Your Character</h2>
        <p className="text-gray-400">
          {character.name} - {character.description}
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
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
          <h3 className="text-xl font-bold">What will you do?</h3>
          <div className="grid grid-cols-1 gap-4">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice)}
                className="bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-200 p-4 rounded-lg border border-gray-700 hover:border-gray-600 text-left"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
