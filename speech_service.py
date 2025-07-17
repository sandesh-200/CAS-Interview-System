import os
import tempfile
from pydub import AudioSegment
from faster_whisper import WhisperModel
from config import WHISPER_MODEL, WHISPER_DEVICE, WHISPER_COMPUTE_TYPE

class SpeechService:
    def __init__(self):
        print("Initializing local Whisper model...")
        self.model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE_TYPE)
        print("✓ Local Whisper model loaded successfully")
    
    def optimize_audio(self, audio_file_path):
        try:
            print("Optimizing audio for faster processing...")
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
            print("Recognizing speech with local Whisper (this may take a few seconds)...")
            
            # Add timeout for transcription
            import signal
            def timeout_handler(signum, frame):
                raise TimeoutError("Transcription timed out")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(30)  # 30 second timeout
            
            try:
                segments, info = self.model.transcribe(
                    optimized_file,
                    language="en",
                    beam_size=5,
                    vad_filter=True,
                    vad_parameters=dict(min_silence_duration_ms=500)
                )
                signal.alarm(0)  # Cancel timeout
                
                text_parts = []
                segments_list = []
                
                for segment in segments:
                    text_parts.append(segment.text)
                    segments_list.append({
                        'start': segment.start,
                        'end': segment.end,
                        'text': segment.text
                    })
                
                full_text = " ".join(text_parts).strip()
                
                if full_text:
                    print(f"✓ Transcribed text: \"{full_text}\"")
                    print(f"✓ Language: {info.language} (confidence: {info.language_probability:.2f})")
                    print(f"✓ Processing time: Local Whisper")
                    print(f"✓ Segments: {len(segments_list)}")
                    
                    return {
                        'text': full_text,
                        'language': info.language,
                        'confidence': 'high' if info.language_probability > 0.8 else 'medium',
                        'segments': segments_list
                    }
                else:
                    print("✗ No speech detected in audio")
                    return self.get_fallback_transcription("No speech detected")
                    
            except TimeoutError:
                signal.alarm(0)  # Cancel timeout
                print("✗ Transcription timed out, using fallback")
                return self.get_fallback_transcription("Transcription timed out - using fallback")
            except Exception as e:
                signal.alarm(0)  # Cancel timeout
                print(f"✗ Error during transcription: {e}")
                return self.get_fallback_transcription(f"Transcription error: {e}")
                    
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