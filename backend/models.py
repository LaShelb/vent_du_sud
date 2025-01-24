from pydantic import BaseModel
from typing import List, Optional
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