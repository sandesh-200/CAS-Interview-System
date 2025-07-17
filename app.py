from flask import Flask
from flask_cors import CORS
from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from session_manager import SessionManager
from speech_service import SpeechService
from ai_service import AIService
from routes import Routes
import signal
import sys

app = Flask(__name__)

# Simpler CORS configuration - allow all origins
CORS(app)

# Initialize services
session_manager = SessionManager()
speech_service = SpeechService()
ai_service = AIService(speech_service)
routes = Routes(session_manager, speech_service, ai_service)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Add timeout handler
def timeout_handler(signum, frame):
    print("Request timeout - killing process")
    sys.exit(1)

# Set timeout for long operations (45 seconds)
signal.signal(signal.SIGALRM, timeout_handler)

# routes
@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'message': 'CAS Interview System is running'}

@app.route('/api/questions', methods=['GET'])
def get_questions():
    return routes.get_questions()

@app.route('/api/start-interview', methods=['POST'])
def start_interview():
    return routes.start_interview()

@app.route('/api/upload-audio', methods=['POST'])
def upload_audio():
    try:
        # Set timeout for this request (45 seconds)
        signal.alarm(45)
        result = routes.upload_audio()
        signal.alarm(0)  # Cancel timeout
        return result
    except Exception as e:
        signal.alarm(0)  # Cancel timeout
        print(f"Error in upload_audio route: {e}")
        import traceback
        traceback.print_exc()
        return {'error': f'Upload failed: {str(e)}'}, 500

@app.route('/api/test-upload', methods=['POST'])
def test_upload():
    try:
        result = routes.test_upload()
        return result
    except Exception as e:
        print(f"Error in test_upload route: {e}")
        import traceback
        traceback.print_exc()
        return {'error': f'Test upload failed: {str(e)}'}, 500

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