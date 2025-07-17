import json
import google.generativeai as genai
from config import GEMINI_API_KEY, CAS_QUESTIONS

class AIService:
    def __init__(self, speech_service):
        self.speech_service = speech_service
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze_interview(self, session_data):
        try:
            print("\n=== AI ANALYSIS START ===")
            
            
            responses_summary = []
            for i, response in enumerate(session_data['responses']):
                question = CAS_QUESTIONS[i]
                transcription = response.get('transcription', {})
                text = transcription.get('text', '')
                has_content = self.speech_service.has_meaningful_content(transcription)
                
                print(f"\nQuestion {i+1}: {question}")
                print(f"Raw transcription: \"{text}\"")
                print(f"Has meaningful content: {has_content}")
                
                responses_summary.append({
                    'question': question,
                    'response': text if has_content else 'No meaningful speech detected',
                    'has_content': has_content
                })
            
            
            prompt = self.create_analysis_prompt(responses_summary)
            
            print("\n=== WHAT AI RECEIVES ===")
            print("Full interview summary sent to AI:")
            print("----------------------------------------")
            for item in responses_summary:
                print(f"Q: {item['question']}")
                print(f"A: {item['response']}")
                print()
            print("----------------------------------------")
            
            # Get AI response
            print("\nSending request to Gemini AI...")
            response = self.model.generate_content(prompt)
            ai_response = response.text
            
            print("\n=== AI RESPONSE ===")
            print("Raw AI response:")
            print("----------------------------------------")
            print(ai_response)
            print("----------------------------------------")

            return self.parse_ai_response(ai_response)
            
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            return self.get_fallback_response(session_data)
    
    def create_analysis_prompt(self, responses_summary):
        
        summary_text = "\n".join([
            f"Question {i+1}: {item['question']}\nResponse: {item['response']}"
            for i, item in enumerate(responses_summary)
        ])
        
        return f"""
You are an expert CAS UK interview evaluator. Analyze the following interview responses and provide a comprehensive assessment.

Interview Summary:
{summary_text}

CRITICAL SCORING GUIDELINES:
- If the candidate provided no meaningful responses (only "No meaningful speech detected"), 
  score them VERY LOW: 0-15 overall score
- If responses are minimal or unclear, score 15-30 overall
- Only score higher (30-100) if there are clear, meaningful responses with actual content

SCORING BREAKDOWN FOR SILENT/NO RESPONSE INTERVIEWS:
- Communication Skills: 0-3 points (no communication demonstrated)
- Knowledge: 0-3 points (no knowledge demonstrated)  
- Motivation: 0-3 points (no motivation demonstrated)
- Adaptability: 0-3 points (no adaptability demonstrated)

For meaningful responses, analyze the actual content and use normal scoring (0-25 per category).

Please provide:
1. Overall Score (0-100) - Use guidelines above
2. Breakdown scores for each category (0-25 each)
3. Detailed feedback for each category based on the actual speech content
4. Strengths identified (if any)
5. Areas for improvement
6. Final recommendation (Pass/Fail with confidence level)

Format your response as JSON with the following structure:
{{
  "overallScore": number,
  "breakdown": {{
    "communication": {{ "score": number, "feedback": "string" }},
    "knowledge": {{ "score": number, "feedback": "string" }},
    "motivation": {{ "score": number, "feedback": "string" }},
    "adaptability": {{ "score": number, "feedback": "string" }}
  }},
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendation": {{
    "decision": "Pass" | "Fail",
    "confidence": "High" | "Medium" | "Low",
    "reasoning": "string"
  }}
}}
"""
    
    def parse_ai_response(self, ai_response):
        try:
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = ai_response[start_idx:end_idx]
                result = json.loads(json_str)
                
                print("\n=== AI ANALYSIS RESULTS ===")
                print(f"✓ Overall Score: {result.get('overallScore', 0)}")
                print("✓ Breakdown scores:")
                for category, details in result.get('breakdown', {}).items():
                    print(f"  - {category}: {details.get('score', 0)}/25 - \"{details.get('feedback', '')}\"")
                print(f"✓ Recommendation: {result.get('recommendation', {}).get('decision', 'Unknown')}")
                
                return result
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return self.get_fallback_response({})
    
    def get_fallback_response(self, session_data):
        print("\n=== USING FALLBACK RESPONSE ===")
        

        has_responses = session_data.get('responses', [])
        has_meaningful_content = any(
            self.speech_service.has_meaningful_content(r.get('transcription', {}))
            for r in has_responses
        )
        
        if not has_responses:
            score = 0
            feedback = "No responses provided during interview"
        elif not has_meaningful_content:
            score = 15
            feedback = "No meaningful responses provided during interview"
        else:
            score = 75
            feedback = "Analysis failed - using default score"
        
        return {
            'overallScore': score,
            'breakdown': {
                'communication': {'score': score//4, 'feedback': feedback},
                'knowledge': {'score': score//4, 'feedback': feedback},
                'motivation': {'score': score//4, 'feedback': feedback},
                'adaptability': {'score': score//4, 'feedback': feedback}
            },
            'strengths': ["Analysis failed - using default assessment"] if has_meaningful_content else ["No strengths identified due to lack of participation"],
            'improvements': ["Analysis failed - using default assessment"] if has_meaningful_content else ["Provide meaningful responses to interview questions", "Practice speaking clearly and confidently"],
            'recommendation': {
                'decision': "Pass" if has_meaningful_content else "Fail",
                'confidence': "Low",
                'reasoning': "Analysis failed - using default assessment" if has_meaningful_content else "Candidate provided no meaningful responses during the interview"
            }
        } 