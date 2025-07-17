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
            print(f"\n=== UPLOAD AUDIO REQUEST ===")
            print(f"Request method: {request.method}")
            print(f"Request headers: {dict(request.headers)}")
            print(f"Request form data keys: {list(request.form.keys())}")
            print(f"Request files keys: {list(request.files.keys())}")
            
            session_id = request.form.get('sessionId')
            question_index = int(request.form.get('questionIndex'))
            
            print(f"Session ID: {session_id}")
            print(f"Question index: {question_index}")
            
            if 'audio' not in request.files:
                print("ERROR: No audio file provided")
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            print(f"Audio file: {audio_file.filename}, size: {len(audio_file.read())}")
            audio_file.seek(0)  # Reset file pointer
            
            # Validate session
            session = self.session_manager.get_session(session_id)
            if not session:
                print(f"ERROR: Session not found: {session_id}")
                return jsonify({'error': 'Session not found'}), 404
            
            print(f"Session found: {session['id']}")
            
            # Validate question index
            if question_index < 0 or question_index >= len(CAS_QUESTIONS):
                print(f"ERROR: Invalid question index: {question_index}")
                return jsonify({'error': 'Invalid question index'}), 400
            
            # Save audio file
            filename = f"{session_id}-{audio_file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            print(f"Saving audio to: {filepath}")
            audio_file.save(filepath)
            print(f"Audio saved successfully, file size: {os.path.getsize(filepath)} bytes")
            
            # Transcribe audio using Google Speech Recognition
            print("Starting transcription...")
            transcription = self.speech_service.transcribe_audio(filepath)
            print(f"Transcription completed: {transcription}")
            
            print(f"\n=== REAL-TIME TRANSCRIPTION FOR QUESTION {question_index + 1} ===")
            print(f"Question: {CAS_QUESTIONS[question_index]}")
            print(f"Transcribed text: \"{transcription.get('text', '')}\"")
            print(f"Language: {transcription.get('language', 'unknown')}")
            print(f"Has meaningful content: {self.speech_service.has_meaningful_content(transcription)}")
            
            # Add response to session
            print("Adding response to session...")
            is_complete = self.session_manager.add_response(
                session_id, 
                question_index, 
                filepath, 
                transcription
            )
            print(f"Response added, interview complete: {is_complete}")
            
            if is_complete:
                print("Interview complete, starting AI analysis...")
                # Analyze the entire interview
                analysis = self.ai_service.analyze_interview(session)
                self.session_manager.set_analysis(session_id, analysis)
                print("AI analysis completed")
            
            response_data = {
                'success': True,
                'nextQuestionIndex': question_index + 1,
                'isComplete': is_complete,
                'nextQuestion': CAS_QUESTIONS[question_index + 1] if not is_complete else None,
                'transcription': transcription.get('text', ''),
                'hasMeaningfulContent': self.speech_service.has_meaningful_content(transcription)
            }
            
            print(f"Returning response: {response_data}")
            return jsonify(response_data)
            
        except Exception as e:
            print(f"ERROR in upload_audio: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to upload audio: {str(e)}'}), 500
    
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
    
    def test_upload(self):
        """Test endpoint - just save audio without transcription"""
        try:
            print(f"\n=== TEST UPLOAD REQUEST ===")
            print(f"Request method: {request.method}")
            print(f"Request headers: {dict(request.headers)}")
            print(f"Request form data keys: {list(request.form.keys())}")
            print(f"Request files keys: {list(request.files.keys())}")
            
            if 'audio' not in request.files:
                print("ERROR: No audio file provided")
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            print(f"Audio file: {audio_file.filename}, size: {len(audio_file.read())}")
            audio_file.seek(0)  # Reset file pointer
            
            # Save audio file
            filename = f"test-{audio_file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            print(f"Saving audio to: {filepath}")
            audio_file.save(filepath)
            print(f"Audio saved successfully, file size: {os.path.getsize(filepath)} bytes")
            
            return jsonify({
                'success': True,
                'message': 'Audio file saved successfully',
                'filename': filename,
                'filepath': filepath,
                'size': os.path.getsize(filepath)
            })
            
        except Exception as e:
            print(f"ERROR in test_upload: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Test upload failed: {str(e)}'}), 500 