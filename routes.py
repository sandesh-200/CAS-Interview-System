from flask import request, jsonify
import os
from datetime import datetime
from config import CAS_QUESTIONS, UPLOAD_FOLDER
from session_manager import SessionManager
from speech_service import SpeechService
from ai_service import AIService

class Routes:
    def __init__(self, session_manager, speech_service, ai_service):
        self.session_manager = session_manager
        self.speech_service = speech_service
        self.ai_service = ai_service
    
    def get_questions(self):
        """Get all interview questions"""
        return jsonify({'questions': CAS_QUESTIONS})
    
    def start_interview(self):
        """Start a new interview session"""
        session_id = self.session_manager.create_session()
        
        return jsonify({
            'sessionId': session_id,
            'currentQuestion': CAS_QUESTIONS[0],
            'totalQuestions': len(CAS_QUESTIONS)
        })
    
    def upload_audio(self):
        """Upload and transcribe audio response"""
        try:
            session_id = request.form.get('sessionId')
            question_index = int(request.form.get('questionIndex'))
            
            if 'audio' not in request.files:
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            
            # Validate session
            session = self.session_manager.get_session(session_id)
            if not session:
                return jsonify({'error': 'Session not found'}), 404
            
            # Validate question index
            if question_index < 0 or question_index >= len(CAS_QUESTIONS):
                return jsonify({'error': 'Invalid question index'}), 400
            
            # Save audio file
            filename = f"{session_id}-{audio_file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            audio_file.save(filepath)
            
            # Transcribe audio
            transcription = self.speech_service.transcribe_audio(filepath)
            
            print(f"\n=== REAL-TIME TRANSCRIPTION FOR QUESTION {question_index + 1} ===")
            print(f"Question: {CAS_QUESTIONS[question_index]}")
            print(f"Transcribed text: \"{transcription.get('text', '')}\"")
            print(f"Language: {transcription.get('language', 'unknown')}")
            print(f"Has meaningful content: {self.speech_service.has_meaningful_content(transcription)}")
            
            # Add response to session
            is_complete = self.session_manager.add_response(
                session_id, 
                question_index, 
                filepath, 
                transcription
            )
            
            if is_complete:
                # Analyze the entire interview
                analysis = self.ai_service.analyze_interview(session)
                self.session_manager.set_analysis(session_id, analysis)
            
            return jsonify({
                'success': True,
                'nextQuestionIndex': question_index + 1,
                'isComplete': is_complete,
                'nextQuestion': CAS_QUESTIONS[question_index + 1] if not is_complete else None,
                'transcription': transcription.get('text', ''),
                'hasMeaningfulContent': self.speech_service.has_meaningful_content(transcription)
            })
            
        except Exception as e:
            print(f"Error uploading audio: {e}")
            return jsonify({'error': 'Failed to upload audio'}), 500
    
    def get_interview_result(self, session_id):
        """Get interview results"""
        result = self.session_manager.get_session_result(session_id)
        if not result:
            return jsonify({'error': 'Session not found or not completed'}), 404
        
        return jsonify(result)
    
    def get_interview_status(self, session_id):
        """Get interview status"""
        status = self.session_manager.get_session_status(session_id)
        if not status:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify(status)
    
    def delete_interview(self, session_id):
        """Delete interview session"""
        if self.session_manager.delete_session(session_id):
            return jsonify({'success': True, 'message': 'Interview session deleted'})
        else:
            return jsonify({'error': 'Session not found'}), 404 