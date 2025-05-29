import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Use SQLite as a default, simpler for development
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///habitspark.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')