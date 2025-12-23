# Ollama Setup Guide for EduPath Quiz Integration

## Overview
This guide will help you set up Ollama to power dynamic quiz generation in your EduPath app.

## Installation Steps

### 1. Install Ollama
- **Windows**: Download from https://ollama.ai/download/windows
- **macOS**: Download from https://ollama.ai/download/mac
- **Linux**: Run `curl -fsSL https://ollama.ai/install.sh | sh`

### 2. Install a Lightweight Model
After installation, open a terminal/command prompt and run:

```bash
# Install a lightweight model (recommended for development)
ollama pull llama3.1:8b

# Alternative smaller models if you have limited resources:
ollama pull llama3.2:3b
ollama pull phi3:mini
```

### 3. Start Ollama Server
```bash
# Start the Ollama server (runs on http://localhost:11434 by default)
ollama serve
```

### 4. Test Ollama Installation
Open a new terminal and test:
```bash
# Test basic functionality
ollama run llama3.1:8b "Hello, how are you?"

# Test JSON generation (what our app uses)
ollama run llama3.1:8b "Generate a JSON object with a 'message' field containing 'Hello World'"
```

## EduPath Integration Testing

### 1. Start Your Backend Server
```bash
cd backend
npm run dev
```

### 2. Test Quiz Generation Endpoint
Use a tool like Postman or curl to test:

```bash
curl -X POST http://localhost:5000/api/quiz/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "JavaScript",
    "level": "medium",
    "count": 3
  }'
```

Expected response:
```json
{
  "ok": true,
  "quiz": {
    "quizId": "generated-id",
    "subject": "JavaScript",
    "level": "medium",
    "questions": [
      {
        "id": "q1",
        "question": "What is a closure in JavaScript?",
        "options": ["...", "...", "...", "..."],
        "correctIndex": 1,
        "explanation": "..."
      }
    ]
  }
}
```

### 3. Test Frontend Integration
1. Start your React Native app
2. Navigate to the Quiz screen
3. Select a subject and difficulty
4. Click "Generate Quiz"
5. Verify questions load dynamically

## Troubleshooting

### Common Issues

**1. Ollama not responding**
- Ensure Ollama server is running: `ollama serve`
- Check if port 11434 is available
- Restart Ollama service

**2. Model not found**
- List installed models: `ollama list`
- Install required model: `ollama pull llama3.1:8b`

**3. JSON parsing errors**
- The app includes fallback mechanisms
- Check backend logs for detailed error messages
- Verify model is generating valid JSON

**4. Slow response times**
- Use smaller models (phi3:mini, llama3.2:3b)
- Reduce question count in requests
- Consider upgrading hardware

### Performance Tips

1. **Model Selection**:
   - `phi3:mini` (3.8GB) - Fastest, good quality
   - `llama3.2:3b` (2GB) - Very fast, decent quality
   - `llama3.1:8b` (4.7GB) - Balanced speed/quality
   - `llama3.1:70b` (40GB) - Best quality, requires powerful hardware

2. **Optimization**:
   - Keep Ollama server running continuously
   - Use temperature settings (0.7-0.9) for consistent output
   - Cache frequently requested quiz topics

## Configuration Options

### Backend Environment Variables
Add to your `.env` file:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
QUIZ_GENERATION_TIMEOUT=30000
```

### Model Parameters
In `quiz.routes.ts`, you can adjust:
- `temperature`: 0.8 (creativity level)
- `top_p`: 0.9 (response diversity)
- `num_predict`: 2048 (max tokens)

## Next Steps

1. **Test the complete flow**: Quiz generation → User answers → Score calculation
2. **Add personalization**: Use user progress data to customize difficulty
3. **Implement caching**: Store generated quizzes to reduce API calls
4. **Add more subjects**: Expand the subject list based on user needs
5. **Monitor performance**: Track generation times and success rates

## Support

If you encounter issues:
1. Check the backend console logs
2. Verify Ollama server status: `ollama ps`
3. Test Ollama directly: `ollama run llama3.1:8b "test"`
4. Review the quiz route error handling in the backend

The integration includes comprehensive fallback mechanisms, so the app will work even if Ollama is temporarily unavailable.
