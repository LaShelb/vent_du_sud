from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class Language(str, Enum):
    ENGLISH = "en"
    FRENCH = "fr"
    SPANISH = "es"
    GERMAN = "de"

# Models
class Character(BaseModel):
    name: str
    description: str
    language: Language
    image_url: str

class Choice(BaseModel):
    id: int
    text: str
    is_custom: bool = False

class StoryResponse(BaseModel):
    story_text: str
    choices: List[Choice]
    allow_custom_choice: bool = True

class UserChoice(BaseModel):
    choice_id: Optional[int] = None
    choice_text: str
    story_context: str
    is_custom: bool = False
    language: Language

class LanguageInfo(BaseModel):
    code: Language
    name: str
    native_name: str