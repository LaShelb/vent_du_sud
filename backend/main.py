from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from mistralai import Mistral

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

# Models
class Character(BaseModel):
    name: str
    description: str

class Choice(BaseModel):
    id: int
    text: str

class StoryResponse(BaseModel):
    story_text: str
    choices: List[Choice]

class UserChoice(BaseModel):
    choice_id: int
    choice_text: str
    story_context: str

# Available characters
CHARACTERS = [
    Character(name="Brave Knight", description="Strong and honorable"),
    Character(name="Wise Mage", description="Intelligent and mysterious"),
    Character(name="Cunning Rogue", description="Clever and resourceful")
]

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Story Adventure API"}

@app.get("/characters", response_model=List[Character])
async def get_characters():
    return CHARACTERS

@app.post("/start-story")
async def start_story(character: Character):
    try:
        # Generate initial story based on character
        response = client.chat.complete(
            model="mistral-tiny",
            messages=[
                {
                    "role": "user",
                    "content": f"Start a fantasy adventure story for a {character.name}. "
                              f"Provide 2-3 choices at the end. "
                              f"Format: Story text followed by CHOICES: and numbered options."
                }
            ]
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
                choices.append(Choice(id=i, text=choice.strip().lstrip("123.").strip()))
        
        return StoryResponse(story_text=main_text, choices=choices)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/continue-story")
async def continue_story(user_choice: UserChoice):
    try:
        response = client.chat.complete(
            model="mistral-tiny",
            messages=[
                {
                    "role": "user",
                    "content": f"Based on the current story context: {user_choice.story_context}\n"
                              f"And the user's choice: {user_choice.choice_text}\n"
                              f"Generate a continuation of the story (2-3 paragraphs) "
                              f"and provide 2-3 choices for the next action. "
                              f"Format: Story text followed by CHOICES: and numbered options."
                }
            ]
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
                choices.append(Choice(id=i, text=choice.strip().lstrip("123.").strip()))
        
        return StoryResponse(story_text=main_text, choices=choices)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
