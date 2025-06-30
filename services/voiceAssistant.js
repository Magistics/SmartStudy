const axios = require('axios');
const WebSocket = require('ws');

class VoiceAssistant {
  constructor() {
    this.omnidimApiKey = process.env.OMNIDIM_API_KEY;
    this.omnidimBaseUrl = process.env.OMNIDIM_BASE_URL || 'https://api.omnidimension.ai';
    this.omnidimModel = process.env.OMNIDIM_MODEL || 'omnidim-1.0';
    this.omnidimVoiceModel = process.env.OMNIDIM_VOICE_MODEL || 'omnidim-voice-1.0';
    
    this.voiceEnabled = process.env.VOICE_ASSISTANT_ENABLED === 'true';
    this.recognitionLanguage = process.env.VOICE_RECOGNITION_LANGUAGE || 'en-US';
    this.speechLanguage = process.env.VOICE_SPEECH_LANGUAGE || 'en-US';
    this.speechRate = parseFloat(process.env.VOICE_SPEECH_RATE) || 1.0;
    this.speechPitch = parseFloat(process.env.VOICE_SPEECH_PITCH) || 1.0;
    this.speechVolume = parseFloat(process.env.VOICE_SPEECH_VOLUME) || 1.0;
    
    this.omnidimVoiceEnabled = process.env.OMNIDIM_VOICE_ENABLED === 'true';
    this.omnidimVoiceSpeed = parseFloat(process.env.OMNIDIM_VOICE_SPEED) || 1.0;
    this.omnidimVoicePitch = parseFloat(process.env.OMNIDIM_VOICE_PITCH) || 1.0;
    this.omnidimVoiceVolume = parseFloat(process.env.OMNIDIM_VOICE_VOLUME) || 1.0;
    this.omnidimVoicePersona = process.env.OMNIDIM_VOICE_PERSONA || 'educational';
    this.omnidimVoiceEmotion = process.env.OMNIDIM_VOICE_EMOTION || 'neutral';
  }

  // Initialize voice assistant
  async initialize() {
    if (!this.voiceEnabled) {
      console.log('Voice assistant is disabled');
      return false;
    }

    if (!this.omnidimApiKey) {
      console.log('OmniDimension API key not configured');
      return false;
    }

    try {
      // Test OmniDimension API connection
      const response = await axios.get(`${this.omnidimBaseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.omnidimApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Voice assistant initialized with OmniDimension');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize voice assistant:', error.message);
      return false;
    }
  }

  // Speech recognition using OmniDimension
  async recognizeSpeech(audioData, options = {}) {
    try {
      const {
        language = this.recognitionLanguage,
        interimResults = true,
        continuous = false,
        timeout = 10000
      } = options;

      const response = await axios.post(`${this.omnidimBaseUrl}/speech/recognize`, {
        audio: audioData,
        config: {
          language: language,
          interim_results: interimResults,
          continuous: continuous,
          timeout: timeout,
          model: this.omnidimModel
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.omnidimApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        text: response.data.text,
        confidence: response.data.confidence,
        language: response.data.language,
        interim: response.data.interim || false
      };
    } catch (error) {
      console.error('Speech recognition error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Text-to-speech using OmniDimension
  async synthesizeSpeech(text, options = {}) {
    try {
      const {
        voice = this.omnidimVoicePersona,
        speed = this.omnidimVoiceSpeed,
        pitch = this.omnidimVoicePitch,
        volume = this.omnidimVoiceVolume,
        emotion = this.omnidimVoiceEmotion,
        language = this.speechLanguage
      } = options;

      const response = await axios.post(`${this.omnidimBaseUrl}/speech/synthesize`, {
        text: text,
        config: {
          voice: voice,
          speed: speed,
          pitch: pitch,
          volume: volume,
          emotion: emotion,
          language: language,
          model: this.omnidimVoiceModel
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.omnidimApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });

      return {
        success: true,
        audio: response.data,
        format: 'wav',
        duration: response.headers['x-audio-duration'] || null
      };
    } catch (error) {
      console.error('Speech synthesis error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process voice command and generate response
  async processVoiceCommand(command, context = {}) {
    try {
      const {
        userLevel = 'high-school',
        subject = 'general',
        previousContext = ''
      } = context;

      // Create prompt for OmniDimension
      const prompt = `
        You are an educational AI tutor. A student has asked: "${command}"
        
        Context:
        - Student level: ${userLevel}
        - Subject: ${subject}
        - Previous context: ${previousContext}
        
        Please provide a helpful, educational response that is appropriate for the student's level.
        Keep the response concise and engaging.
      `;

      const response = await axios.post(`${this.omnidimBaseUrl}/chat/completions`, {
        model: this.omnidimModel,
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
          'Authorization': `Bearer ${this.omnidimApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;

      // Synthesize the response to speech
      const speechResult = await this.synthesizeSpeech(aiResponse, {
        voice: this.omnidimVoicePersona,
        emotion: 'friendly'
      });

      return {
        success: true,
        command: command,
        response: aiResponse,
        speech: speechResult,
        context: {
          userLevel,
          subject,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Voice command processing error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate voice quiz questions
  async generateVoiceQuiz(topic, difficulty = 'medium', count = 3) {
    try {
      const prompt = `
        Generate ${count} quiz questions about "${topic}" at ${difficulty} difficulty level.
        Format each question as: "Question: [question text] Answer: [answer]"
        Make the questions suitable for voice interaction.
      `;

      const response = await axios.post(`${this.omnidimBaseUrl}/chat/completions`, {
        model: this.omnidimModel,
        messages: [
          {
            role: 'system',
            content: 'You are an educational quiz generator that creates voice-friendly questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.omnidimApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const quizContent = response.data.choices[0].message.content;
      
      // Parse quiz questions
      const questions = this.parseQuizQuestions(quizContent);

      return {
        success: true,
        topic: topic,
        difficulty: difficulty,
        questions: questions
      };
    } catch (error) {
      console.error('Voice quiz generation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Parse quiz questions from AI response
  parseQuizQuestions(content) {
    const questions = [];
    const lines = content.split('\n');
    let currentQuestion = null;

    for (const line of lines) {
      if (line.startsWith('Question:')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.replace('Question:', '').trim(),
          answer: ''
        };
      } else if (line.startsWith('Answer:') && currentQuestion) {
        currentQuestion.answer = line.replace('Answer:', '').trim();
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  }

  // Create WebSocket connection for real-time voice interaction
  createVoiceWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      console.log('Voice WebSocket client connected');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'voice_command':
              const result = await this.processVoiceCommand(data.command, data.context);
              ws.send(JSON.stringify({
                type: 'voice_response',
                data: result
              }));
              break;

            case 'speech_recognition':
              const recognitionResult = await this.recognizeSpeech(data.audio, data.options);
              ws.send(JSON.stringify({
                type: 'recognition_result',
                data: recognitionResult
              }));
              break;

            case 'generate_voice_quiz':
              const quizResult = await this.generateVoiceQuiz(data.topic, data.difficulty, data.count);
              ws.send(JSON.stringify({
                type: 'voice_quiz',
                data: quizResult
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Unknown message type'
              }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      });

      ws.on('close', () => {
        console.log('Voice WebSocket client disconnected');
      });
    });

    return wss;
  }

  // Get voice assistant status
  getStatus() {
    return {
      enabled: this.voiceEnabled,
      omnidimEnabled: this.omnidimVoiceEnabled,
      apiKeyConfigured: !!this.omnidimApiKey,
      recognitionLanguage: this.recognitionLanguage,
      speechLanguage: this.speechLanguage,
      voicePersona: this.omnidimVoicePersona
    };
  }
}

module.exports = VoiceAssistant; 