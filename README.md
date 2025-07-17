# CAS UK Interview Speech System

A comprehensive interview practice system designed specifically for CAS UK interviews. This system uses voice recording and Gemini AI to provide detailed analysis and scoring of interview performance.

## Features

- **Voice Recording**: Record responses to interview questions using your microphone
- **CAS UK Focused**: 10 carefully selected questions relevant to CAS UK interviews
- **AI Analysis**: Uses Gemini AI to analyze responses and provide detailed feedback
- **Comprehensive Scoring**: Scores across 4 categories (Communication, Knowledge, Motivation, Adaptability)
- **Visual Results**: Interactive charts and detailed breakdown of performance
- **Session Management**: Resume interviews or view previous results
- **Modern UI**: Beautiful, responsive design with smooth animations

## Technology Stack

### Backend
- **Node.js/Express**: Server framework
- **Multer**: File upload handling
- **Google Generative AI**: Gemini AI for analysis
- **CORS**: Cross-origin resource sharing

### Frontend
- **React**: User interface framework
- **React Router**: Navigation
- **React Icons**: Icon library
- **Recharts**: Data visualization
- **Web Audio API**: Voice recording
- **Framer Motion**: Animations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Microphone access
- Gemini AI API key (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Get your free Gemini AI API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

3. Update your `.env` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
```

### 3. Build the Frontend

```bash
cd client
npm run build
cd ..
```

### 4. Start the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

## Usage

### Starting an Interview

1. Visit the application in your browser
2. Click "Start Interview"
3. Allow microphone access when prompted
4. Answer each question by recording your response
5. Submit your answer and move to the next question
6. Complete all 10 questions to get your analysis

### Understanding Results

The system provides:

- **Overall Score**: 0-100 points
- **Category Breakdown**: 
  - Communication Skills (0-25)
  - Knowledge of Course/University (0-25)
  - Motivation and Goals (0-25)
  - Adaptability and Problem-solving (0-25)
- **Detailed Feedback**: Specific comments for each category
- **Strengths**: Areas where you performed well
- **Improvements**: Areas for development
- **Recommendation**: Pass/Fail with confidence level

## Interview Questions

The system includes 10 CAS UK-specific questions:

1. Tell me about yourself and your background
2. Why are you interested in studying in the UK?
3. What do you know about your chosen course and university?
4. How do you plan to finance your studies?
5. What are your career goals after graduation?
6. How do you handle challenges and stress?
7. What extracurricular activities are you involved in?
8. How do you plan to adapt to life in the UK?
9. What do you think about the current state of your field of study?
10. How do you stay organized and manage your time?

## File Structure

```
cas-interview-speech-system/
├── server.js                 # Express server
├── package.json             # Backend dependencies
├── .env                     # Environment variables
├── uploads/                 # Audio file storage
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Welcome.js
│   │   │   ├── Interview.js
│   │   │   └── Results.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/questions` - Get interview questions
- `POST /api/start-interview` - Start new interview session
- `POST /api/upload-audio` - Upload audio response
- `GET /api/interview-result/:sessionId` - Get interview results

## Troubleshooting

### Microphone Issues
- Ensure your browser has permission to access the microphone
- Try refreshing the page and allowing permissions again
- Check that your microphone is working in other applications

### API Key Issues
- Verify your Gemini AI API key is correct
- Ensure you have sufficient API quota
- Check the console for error messages

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to a newer version
- Check for conflicting port usage

## Development

### Adding New Questions
Edit the `casInterviewQuestions` array in `server.js`

### Customizing Analysis
Modify the prompt in the `analyzeInterview` function in `server.js`

### Styling Changes
Edit CSS files in `client/src/` directory

## License

MIT License - feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console for error messages
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

---

**Note**: This system is designed for practice purposes. Real CAS UK interviews may have different formats and requirements. 