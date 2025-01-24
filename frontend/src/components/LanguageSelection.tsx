'use client';

import { useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface Props {
  onSelect: (language: Language) => void;
}

const UI_TRANSLATIONS = {
  en: {
    title: "Choose Your Language",
  },
  fr: {
    title: "Choisissez Votre Langue",
  },
  es: {
    title: "Elige Tu Idioma",
  },
  de: {
    title: "Wähle Deine Sprache",
  },
};

export default function LanguageSelection({ onSelect }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('http://localhost:8000/languages');
        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{UI_TRANSLATIONS.en.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onSelect(language)}
            className="group bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-colors duration-200 p-6 rounded-lg border border-gray-700 hover:border-gray-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold group-hover:text-emerald-400 transition-colors">
                  {language.native_name}
                </div>
                <div className="text-sm text-gray-400">{language.name}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-emerald-400"
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
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
