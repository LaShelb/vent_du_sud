from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv
from mistralai import Mistral

from models import Character, Choice, StoryResponse, UserChoice, Language, LanguageInfo

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Story Adventure API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Mistral client
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

# Language configurations
LANGUAGES = [
    LanguageInfo(code=Language.ENGLISH, name="English", native_name="English"),
    LanguageInfo(code=Language.FRENCH, name="French", native_name="Français"),
    LanguageInfo(code=Language.SPANISH, name="Spanish", native_name="Español"),
    LanguageInfo(code=Language.GERMAN, name="German", native_name="Deutsch"),
]

# Character translations
CHARACTER_TRANSLATIONS = {
    Language.ENGLISH: [
        Character(name="Brave Knight", description="Strong and honorable", language=Language.ENGLISH, image_url="/images/characters/knight.svg"),
        Character(name="Wise Mage", description="Intelligent and mysterious", language=Language.ENGLISH, image_url="/images/characters/mage.svg"),
        Character(name="Cunning Rogue", description="Clever and resourceful", language=Language.ENGLISH, image_url="/images/characters/rogue.svg")
    ],
    Language.FRENCH: [
        Character(name="Chevalier Courageux", description="Fort et honorable", language=Language.FRENCH, image_url="/images/characters/knight.svg"),
        Character(name="Mage Sage", description="Intelligent et mystérieux", language=Language.FRENCH, image_url="/images/characters/mage.svg"),
        Character(name="Voleur Rusé", description="Astucieux et débrouillard", language=Language.FRENCH, image_url="/images/characters/rogue.svg")
    ],
    Language.SPANISH: [
        Character(name="Caballero Valiente", description="Fuerte y honorable", language=Language.SPANISH, image_url="/images/characters/knight.svg"),
        Character(name="Mago Sabio", description="Inteligente y misterioso", language=Language.SPANISH, image_url="/images/characters/mage.svg"),
        Character(name="Pícaro Astuto", description="Ingenioso y recursivo", language=Language.SPANISH, image_url="/images/characters/rogue.svg")
    ],
    Language.GERMAN: [
        Character(name="Tapferer Ritter", description="Stark und ehrenvoll", language=Language.GERMAN, image_url="/images/characters/knight.svg"),
        Character(name="Weiser Magier", description="Intelligent und geheimnisvoll", language=Language.GERMAN, image_url="/images/characters/mage.svg"),
        Character(name="Schlauer Schurke", description="Clever und findig", language=Language.GERMAN, image_url="/images/characters/rogue.svg")
    ]
}

# Language prompts
LANGUAGE_PROMPTS = {
    Language.ENGLISH: {
        "start": "You are a creative storyteller. Start an interactive fantasy adventure story for a {character}. ",
        "choices": "What will you do?",
        "custom": "Or do something else..."
    },
    Language.FRENCH: {
        "start": "Tu es un conteur créatif. Commence une histoire d'aventure fantastique interactive pour un {character}. ",
        "choices": "Que vas-tu faire ?",
        "custom": "Ou faire autre chose..."
    },
    Language.SPANISH: {
        "start": "Eres un narrador creativo. Comienza una historia de aventura fantástica interactiva para un {character}. ",
        "choices": "¿Qué harás?",
        "custom": "O hacer otra cosa..."
    },
    Language.GERMAN: {
        "start": "Du bist ein kreativer Geschichtenerzähler. Beginne eine interaktive Fantasy-Abenteuergeschichte für einen {character}. ",
        "choices": "Was wirst du tun?",
        "custom": "Oder etwas anderes tun..."
    }
}

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Story Adventure API"}

@app.get("/languages", response_model=List[LanguageInfo])
async def get_languages():
    return LANGUAGES

@app.get("/characters/{language}", response_model=List[Character])
async def get_characters(language: Language):
    return CHARACTER_TRANSLATIONS.get(language, CHARACTER_TRANSLATIONS[Language.ENGLISH])

@app.post("/start-story")
async def start_story(character: Character):
    try:
        prompt_template = LANGUAGE_PROMPTS[character.language]["start"]
        prompt = (
            f"{prompt_template}\n"
            f"The story should be in {character.language.value} language. "
            f"The story should be engaging and provide 2-3 suggested choices, but also allow for custom choices. "
            f"Format your response as follows:\n"
            f"1. A compelling story introduction (2-3 paragraphs)\n"
            f"2. End with 'CHOICES:' followed by numbered suggestions\n"
            f"Make the story immersive and the choices meaningful."
        )

        response = client.chat.complete(
            model="mistral-tiny",
            messages=[{"role": "user", "content": prompt}]
        )
        
        story_text = response.choices[0].message.content
        
        # Split story and choices
        story_parts = story_text.split("CHOICES:")
        main_text = story_parts[0].strip()
        
        # Parse choices
        choices_text = story_parts[1].strip() if len(story_parts) > 1 else ""
        choices = []
        for i, choice in enumerate(choices_text.split("\n"), 1):
            if choice.strip():
                choices.append(Choice(
                    id=i,
                    text=choice.strip().lstrip("123.").strip(),
                    is_custom=False
                ))
        
        return StoryResponse(
            story_text=main_text,
            choices=choices,
            allow_custom_choice=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/continue-story")
async def continue_story(user_choice: UserChoice):
    try:
        # Create prompt based on whether it's a custom choice or not
        prompt = (
            f"Previous story context: {user_choice.story_context}\n\n"
            f"{'The user chose to do something unexpected' if user_choice.is_custom else 'The user chose'}: {user_choice.choice_text}\n\n"
            f"Continue the story in {user_choice.language.value} language. Make the continuation engaging and provide 2-3 new suggested choices.\n"
            f"Format your response as follows:\n"
            f"1. A compelling continuation (2-3 paragraphs)\n"
            f"2. End with 'CHOICES:' followed by numbered suggestions"
        )

        response = client.chat.complete(
            model="mistral-tiny",
            messages=[{"role": "user", "content": prompt}]
        )
        
        story_text = response.choices[0].message.content
        
        # Split story and choices
        story_parts = story_text.split("CHOICES:")
        main_text = story_parts[0].strip()
        
        # Parse choices
        choices_text = story_parts[1].strip() if len(story_parts) > 1 else ""
        choices = []
        for i, choice in enumerate(choices_text.split("\n"), 1):
            if choice.strip():
                choices.append(Choice(
                    id=i,
                    text=choice.strip().lstrip("123.").strip(),
                    is_custom=False
                ))
        
        return StoryResponse(
            story_text=main_text,
            choices=choices,
            allow_custom_choice=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
