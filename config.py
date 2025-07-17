import os
from dotenv import load_dotenv
load_dotenv()

FLASK_HOST = '0.0.0.0'
FLASK_PORT = int(os.getenv('PORT', 5000))
FLASK_DEBUG = os.getenv('FLASK_ENV') != 'production'

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

WHISPER_MODEL = "base"
WHISPER_DEVICE = "cpu"
WHISPER_COMPUTE_TYPE = "int8"

CAS_QUESTIONS = [
    "Tell me about yourself and your background.",
    "Why are you interested in studying in the UK?",
    "What do you know about your chosen course and university?",
    "How do you plan to finance your studies?",
    "What are your career goals after graduation?",
    "How do you handle challenges and stress?",
    "What extracurricular activities are you involved in?",
    "How do you plan to adapt to life in the UK?",
    "What do you think about the current state of your field of study?",
    "How do you stay organized and manage your time?"
]

UPLOAD_FOLDER = 'uploads'
ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3', 'm4a', 'ogg', 'webm'} 