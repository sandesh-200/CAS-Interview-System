import uuid
from datetime import datetime
from config import CAS_QUESTIONS

class SessionManager:
    def __init__(self):
        self.sessions = {}
    
    def create_session(self):
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            'id': session_id,
            'start_time': datetime.now(),
            'responses': [],
            'status': 'active'
        }
        return session_id
    
    def get_session(self, session_id):
        return self.sessions.get(session_id)
    
    def add_response(self, session_id, question_index, audio_path, transcription):
        if session_id not in self.sessions:
            raise ValueError("Session not found")
        
        if question_index < 0 or question_index >= len(CAS_QUESTIONS):
            raise ValueError("Invalid question index")
        
        response_data = {
            'question': CAS_QUESTIONS[question_index],
            'audioPath': audio_path,
            'transcription': transcription,
            'timestamp': datetime.now()
        }
        
        self.sessions[session_id]['responses'].append(response_data)
        
        is_complete = len(self.sessions[session_id]['responses']) == len(CAS_QUESTIONS)
        
        if is_complete:
            self.sessions[session_id]['status'] = 'completed'
            self.sessions[session_id]['end_time'] = datetime.now()
        
        return is_complete
    
    def set_analysis(self, session_id, analysis):
        if session_id in self.sessions:
            self.sessions[session_id]['analysis'] = analysis
    
    def delete_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def get_session_status(self, session_id):
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        return {
            'sessionId': session['id'],
            'status': session['status'],
            'currentQuestion': len(session['responses']),
            'totalQuestions': len(CAS_QUESTIONS),
            'startTime': session['start_time'].isoformat(),
            'endTime': session.get('end_time', '').isoformat() if session.get('end_time') else None
        }
    
    def get_session_result(self, session_id):
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        if session['status'] != 'completed':
            return None
        
        return {
            'sessionId': session['id'],
            'analysis': session.get('analysis'),
            'duration': (session['end_time'] - session['start_time']).total_seconds(),
            'totalQuestions': len(CAS_QUESTIONS)
        } 