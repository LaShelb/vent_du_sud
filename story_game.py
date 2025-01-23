import os
from dotenv import load_dotenv
from mistralai import Mistral

# Load environment variables
load_dotenv()

# Initialize Mistral AI client
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

class StoryGame:
    def __init__(self):
        self.character = None
        self.story_context = ""
        self.chat_history = []

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_with_border(self, text):
        width = 80
        print("=" * width)
        for line in text.split('\n'):
            print(f"| {line:<{width-4}} |")
        print("=" * width)

    def get_character_selection(self):
        characters = {
            "1": "Brave Knight",
            "2": "Wise Mage",
            "3": "Cunning Rogue"
        }
        
        self.clear_screen()
        self.print_with_border("Choose Your Character:\n\n"
                             "1. Brave Knight - Strong and honorable\n"
                             "2. Wise Mage - Intelligent and mysterious\n"
                             "3. Cunning Rogue - Clever and resourceful")
        
        while True:
            choice = input("\nEnter your choice (1-3): ")
            if choice in characters:
                return characters[choice]
            print("Invalid choice. Please try again.")

    def generate_story_continuation(self, user_choice):
        # Prepare the message for Mistral AI
        messages = self.chat_history + [
            {
                "role": "user",
                "content": f"Based on the current story context: {self.story_context}\n"
                        f"And the user's choice: {user_choice}\n"
                        f"Generate a short continuation of the story (2-3 paragraphs) "
                        f"and provide 2-3 choices for the next action. "
                        f"Format: Story text followed by CHOICES: and numbered options."
            }
        ]

        # Get response from Mistral AI
        response = client.chat.complete(
            model="mistral-tiny",
            messages=messages
        )

        return response.choices[0].message.content

    def get_user_choice(self, choices):
        while True:
            try:
                choice = int(input("\nEnter your choice: "))
                if 1 <= choice <= len(choices):
                    return choice
                print("Invalid choice. Please try again.")
            except ValueError:
                print("Please enter a number.")

    def start_game(self):
        self.clear_screen()
        print("Welcome to the Interactive Story Adventure!")
        
        # Character selection
        self.character = self.get_character_selection()
        
        # Initialize story based on character
        initial_prompt = f"Start a fantasy adventure story for a {self.character}. Provide 2-3 choices at the end. Format: Story text followed by CHOICES: and numbered options."
        
        messages = [{"role": "user", "content": initial_prompt}]
        response = client.chat.complete(
            model="mistral-tiny",
            messages=messages
        )
        
        self.story_context = response.choices[0].message.content
        self.chat_history.extend([messages[0], {"role": "assistant", "content": self.story_context}])

        # Main game loop
        while True:
            self.clear_screen()
            story_text = self.story_context.split("CHOICES:")[0]
            choices = self.story_context.split("CHOICES:")[1].strip().split("\n")
            
            self.print_with_border(story_text)
            print("\nCHOICES:")
            for choice in choices:
                print(choice.strip())

            user_choice = self.get_user_choice(choices)
            chosen_action = choices[user_choice - 1]
            
            # Generate next part of the story
            self.story_context = self.generate_story_continuation(chosen_action)
            
            # Check for story ending
            if "THE END" in self.story_context.upper():
                self.clear_screen()
                self.print_with_border(self.story_context)
                print("\nThank you for playing!")
                break

if __name__ == "__main__":
    game = StoryGame()
    game.start_game()
