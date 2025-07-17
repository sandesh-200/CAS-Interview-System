import os
import tempfile
from pydub import AudioSegment
import speech_recognition as sr
from config import UPLOAD_FOLDER

class SpeechService:
    def __init__(self):
        print("Initializing Google Speech Recognition...")
        self.recognizer = sr.Recognizer()
        print("✓ Google Speech Recognition initialized successfully")
    
    def optimize_audio(self, audio_file_path):
        try:
            print("Optimizing audio for speech recognition...")
            audio = AudioSegment.from_file(audio_file_path)
            audio = audio.set_frame_rate(16000)
            if audio.channels > 1:
                audio = audio.set_channels(1)
            audio = audio.normalize()
            temp_optimized = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            audio.export(temp_optimized.name, format='wav', parameters=["-ar", "16000", "-ac", "1"])
            
            print(f"✓ Audio optimized: {os.path.getsize(audio_file_path)} bytes → {os.path.getsize(temp_optimized.name)} bytes")
            return temp_optimized.name
            
        except Exception as e:
            print(f"✗ Audio optimization failed: {e}")
            return audio_file_path
    
    def transcribe_audio(self, audio_file_path):
        optimized_file = None
        
        try:
            print(f"\n=== TRANSCRIBING: {os.path.basename(audio_file_path)} ===")
            print(f"Original file size: {os.path.getsize(audio_file_path)} bytes")
            optimized_file = self.optimize_audio(audio_file_path)
            
            print("Loading optimized audio file...")
            print("Recognizing speech with Google Speech Recognition...")
            
            # Load the audio file
            with sr.AudioFile(optimized_file) as source:
                # Read the audio data
                audio_data = self.recognizer.record(source)
                
                # Recognize speech using Google's free speech recognition
                text = self.recognizer.recognize_google(audio_data, language='en-US')
                
                if text:
                    print(f"✓ Transcribed text: \"{text}\"")
                    print(f"✓ Language: English")
                    print(f"✓ Processing time: Google Speech Recognition")
                    
                    return {
                        'text': text,
                        'language': 'en',
                        'confidence': 'high',
                        'segments': [{'start': 0, 'end': len(text), 'text': text}]
                    }
                else:
                    print("✗ No speech detected in audio")
                    return self.get_fallback_transcription("No speech detected")
                    
        except sr.UnknownValueError:
            print("✗ Speech not recognized - audio may be unclear or silent")
            return self.get_fallback_transcription("Speech not recognized - please speak clearly")
        except sr.RequestError as e:
            print(f"✗ Google Speech Recognition service error: {e}")
            return self.get_fallback_transcription("Speech recognition service unavailable")
        except Exception as e:
            print(f"✗ Error transcribing audio: {e}")
            return self.get_fallback_transcription(f"Transcription error: {e}")
        finally:
            if optimized_file and optimized_file != audio_file_path:
                try:
                    os.unlink(optimized_file)
                except:
                    pass
    
    def get_fallback_transcription(self, error_msg):
        return {
            'text': '',
            'language': 'unknown',
            'confidence': 'low',
            'error': error_msg
        }
    
    def has_meaningful_content(self, transcription):
        if not transcription or not transcription.get('text'):
            return False
        
        text = transcription['text'].strip().lower()
        if len(text) < 10:
            return False
        words = text.split()
        if len(words) < 3:
            return False
        
        return True 