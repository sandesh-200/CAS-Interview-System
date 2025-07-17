from flask import Flask
from flask_cors import CORS
from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from session_manager import SessionManager
from speech_service import SpeechService
from ai_service import AIService
from routes import Routes

app = Flask(__name__)

# Configure CORS to allow frontend domain
CORS(app, origins=[
    "https://cas-interview-system-frontend.onrender.com",
    "https://cas-interview-frontend.onrender.com",
    "http://localhost:3000",  # For local development
    "http://localhost:5000"   # For local development
], supports_credentials=True)

# Initialize services
session_manager = SessionManager()
speech_service = SpeechService()
ai_service = AIService(speech_service)
routes = Routes(session_manager, speech_service, ai_service)

# routes
@app.route('/api/questions', methods=['GET'])
def get_questions():
    return routes.get_questions()

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    return routes.start_interview()

@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():
    return routes.upload_audio()

@app.route('/api/interview-result/<session_id>', methods=['GET'])
def get_interview_result(session_id):
    return routes.get_interview_result(session_id)

@app.route('/api/interview-status/<session_id>', methods=['GET'])
def get_interview_status(session_id):
    return routes.get_interview_status(session_id)

@app.route('/api/interview/<session_id>', methods=['DELETE'])
def delete_interview(session_id):
    return routes.delete_interview(session_id)

if __name__ == '__main__':
    print("Starting CAS Interview System with Python Speech Recognition...")
    print("Server will be available at http://localhost:5000")
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT) 