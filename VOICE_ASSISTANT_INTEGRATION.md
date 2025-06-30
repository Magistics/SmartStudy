# Voice Assistant Integration with OmniDimension

## Overview

The SmartStudy Copilot now includes a comprehensive voice assistant powered by OmniDimension API, providing hands-free learning experiences through voice recognition and text-to-speech capabilities.

## Features

### 🎤 Voice Recognition
- **Natural Language Processing**: Speak questions and commands naturally
- **Multi-language Support**: Recognition in multiple languages (en-US, en-GB, es-ES, fr-FR, de-DE)
- **Real-time Processing**: Instant speech-to-text conversion
- **Interim Results**: See partial recognition results as you speak
- **Continuous Recognition**: Option to keep listening for multiple commands

### 🔊 Text-to-Speech
- **OmniDimension Integration**: High-quality voice synthesis
- **Educational Personas**: Different voice styles (educational, friendly, professional, enthusiastic)
- **Customizable Settings**: Adjust speed, pitch, volume, and emotion
- **Multi-language Output**: Speech synthesis in multiple languages
- **Audio Controls**: Play, pause, and stop audio responses

### 🎯 Voice Quizzes
- **Interactive Voice Quizzes**: Take quizzes entirely through voice
- **Spoken Questions**: Questions are read aloud to you
- **Voice Answers**: Speak your answers naturally
- **Instant Feedback**: Get immediate spoken feedback on answers
- **Progress Tracking**: Voice quiz results are tracked like regular quizzes

### ⚙️ Voice Settings
- **Language Configuration**: Set recognition and speech languages
- **Voice Persona Selection**: Choose from different voice styles
- **Recognition Options**: Configure continuous recognition and interim results
- **Auto-processing**: Automatically process voice commands
- **Persistent Settings**: Settings saved to localStorage

## Technical Implementation

### Backend Components

#### Voice Assistant Service (`services/voiceAssistant.js`)
```javascript
class VoiceAssistant {
  // Initialize with OmniDimension API
  constructor() {
    this.omnidimApiKey = process.env.OMNIDIM_API_KEY;
    this.omnidimBaseUrl = process.env.OMNIDIM_BASE_URL;
    // ... configuration
  }
  
  // Speech recognition using OmniDimension
  async recognizeSpeech(audioData, options = {})
  
  // Text-to-speech using OmniDimension
  async synthesizeSpeech(text, options = {})
  
  // Process voice commands with AI
  async processVoiceCommand(command, context = {})
  
  // Generate voice-friendly quizzes
  async generateVoiceQuiz(topic, difficulty, count)
}
```

#### API Endpoints
- `GET /api/voice/status` - Get voice assistant status
- `POST /api/voice/command` - Process voice commands
- `POST /api/voice/synthesize` - Convert text to speech
- `POST /api/voice/quiz` - Generate voice quizzes

#### WebSocket Integration
- Real-time voice interaction
- Instant command processing
- Live speech recognition results
- Voice quiz responses

### Frontend Components

#### Voice Recognition
```javascript
// Initialize speech recognition
recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US';

// Handle recognition results
recognition.onresult = (event) => {
  // Process speech recognition results
};
```

#### Text-to-Speech
```javascript
// Synthesize speech via API
async function speakText(text, options = {}) {
  const response = await fetch('/api/voice/synthesize', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: JSON.stringify({ text, options })
  });
  
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  // Play audio
}
```

#### Voice Quiz System
```javascript
// Generate voice quiz
async function generateVoiceQuiz(topic, difficulty, count) {
  const response = await fetch('/api/voice/quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, difficulty, count })
  });
  
  const quizData = await response.json();
  return quizData.result;
}

// Take voice quiz
function startVoiceQuiz() {
  speakVoiceQuestion();
  // Set up recognition for answers
}
```

## Configuration

### Environment Variables
```env
# OmniDimension Configuration
OMNIDIM_API_KEY=your_omnidim_api_key_here
OMNIDIM_BASE_URL=https://api.omnidimension.ai
OMNIDIM_MODEL=omnidim-1.0
OMNIDIM_VOICE_MODEL=omnidim-voice-1.0

# Voice Assistant Configuration
VOICE_ASSISTANT_ENABLED=true
VOICE_RECOGNITION_LANGUAGE=en-US
VOICE_SPEECH_LANGUAGE=en-US
VOICE_SPEECH_RATE=1.0
VOICE_SPEECH_PITCH=1.0
VOICE_SPEECH_VOLUME=1.0

# OmniDimension Voice Settings
OMNIDIM_VOICE_ENABLED=true
OMNIDIM_VOICE_SPEED=1.0
OMNIDIM_VOICE_PITCH=1.0
OMNIDIM_VOICE_VOLUME=1.0
OMNIDIM_VOICE_PERSONA=educational
OMNIDIM_VOICE_EMOTION=neutral
```

### Browser Requirements
- **Speech Recognition**: Web Speech API support (Chrome, Edge, Safari)
- **Speech Synthesis**: Web Speech API support (all modern browsers)
- **WebSocket**: WebSocket support for real-time communication
- **Audio API**: AudioContext support for audio processing

## Usage Examples

### Basic Voice Command
1. Click "Start Listening" button
2. Speak your question: "What is photosynthesis?"
3. Click "Process Voice Command"
4. Listen to the AI response

### Text-to-Speech
1. Enter text in the "Text to Speak" field
2. Adjust speed and pitch sliders
3. Select voice persona
4. Click "Speak Text"
5. Audio will play automatically

### Voice Quiz
1. Enter quiz topic (e.g., "Mathematics")
2. Select difficulty and number of questions
3. Click "Generate Voice Quiz"
4. Click "Start Quiz"
5. Listen to questions and speak answers
6. Get instant feedback

### Voice Settings
1. Select recognition and speech languages
2. Choose voice persona
3. Configure recognition options
4. Click "Save Settings"

## API Integration

### OmniDimension API Calls

#### Speech Recognition
```javascript
const response = await axios.post(`${omnidimBaseUrl}/speech/recognize`, {
  audio: audioData,
  config: {
    language: 'en-US',
    interim_results: true,
    continuous: false,
    timeout: 10000,
    model: 'omnidim-1.0'
  }
}, {
  headers: {
    'Authorization': `Bearer ${omnidimApiKey}`,
    'Content-Type': 'application/json'
  }
});
```

#### Text-to-Speech
```javascript
const response = await axios.post(`${omnidimBaseUrl}/speech/synthesize`, {
  text: text,
  config: {
    voice: 'educational',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    emotion: 'friendly',
    language: 'en-US',
    model: 'omnidim-voice-1.0'
  }
}, {
  headers: {
    'Authorization': `Bearer ${omnidimApiKey}`,
    'Content-Type': 'application/json'
  },
  responseType: 'arraybuffer'
});
```

#### AI Chat Completion
```javascript
const response = await axios.post(`${omnidimBaseUrl}/chat/completions`, {
  model: 'omnidim-1.0',
  messages: [
    {
      role: 'system',
      content: 'You are an educational AI tutor that provides helpful, age-appropriate explanations.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  max_tokens: 500,
  temperature: 0.7
}, {
  headers: {
    'Authorization': `Bearer ${omnidimApiKey}`,
    'Content-Type': 'application/json'
  }
});
```

## Testing

### Run Voice Assistant Tests
```bash
npm run test:voice
```

### Test Individual Components
```javascript
// Test voice status
node -e "require('./test-voice.js').testVoiceStatus()"

// Test voice command processing
node -e "require('./test-voice.js').testVoiceCommand()"

// Test text-to-speech
node -e "require('./test-voice.js').testTextToSpeech()"

// Test voice quiz generation
node -e "require('./test-voice.js').testVoiceQuiz()"

// Test WebSocket connection
node -e "require('./test-voice.js').testWebSocketConnection()"
```

## Troubleshooting

### Common Issues

#### Speech Recognition Not Working
- Check browser compatibility
- Ensure microphone permissions are granted
- Verify HTTPS connection (required for speech recognition)
- Check console for error messages

#### Text-to-Speech Not Working
- Verify OmniDimension API key is configured
- Check network connectivity
- Ensure audio output is not muted
- Check browser audio settings

#### WebSocket Connection Issues
- Verify server is running
- Check firewall settings
- Ensure WebSocket protocol is supported
- Check console for connection errors

#### Voice Quiz Problems
- Ensure authentication is valid
- Check quiz generation parameters
- Verify voice recognition is working
- Check audio playback settings

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=DEBUG
```

### Performance Optimization
- Use appropriate audio quality settings
- Limit concurrent voice operations
- Implement proper error handling
- Cache frequently used audio responses

## Security Considerations

### API Key Security
- Store OmniDimension API key securely
- Use environment variables
- Never expose API keys in client-side code
- Implement proper access controls

### Audio Data Handling
- Validate audio input formats
- Implement file size limits
- Secure audio file storage
- Clean up temporary audio files

### User Privacy
- Inform users about voice data collection
- Implement data retention policies
- Provide opt-out options
- Follow privacy regulations

## Future Enhancements

### Planned Features
- **Multi-modal Learning**: Combine voice with visual elements
- **Voice Biometrics**: User identification through voice
- **Advanced Language Models**: Integration with more AI models
- **Real-time Translation**: Multi-language voice translation
- **Voice Analytics**: Analyze learning patterns through voice
- **Accessibility Features**: Enhanced support for users with disabilities

### Technical Improvements
- **Offline Support**: Local speech recognition when possible
- **Audio Compression**: Optimize audio file sizes
- **Caching System**: Cache frequently used responses
- **Load Balancing**: Distribute voice processing load
- **Mobile Optimization**: Enhanced mobile voice experience

## Support

For voice assistant support:
- Check the troubleshooting section
- Review browser compatibility
- Verify API configuration
- Test with the provided test scripts
- Contact development team for issues

---

**Voice Assistant Integration completed with OmniDimension API for enhanced learning experiences! 🎤✨** 