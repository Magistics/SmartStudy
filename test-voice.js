// Voice Assistant Test Script
// This script tests the voice assistant functionality

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data for voice assistant
const testVoiceCommand = {
    command: "What is photosynthesis?",
    context: {
        userLevel: "high-school",
        subject: "science",
        previousContext: "Learning about plant biology"
    }
};

const testTextToSpeak = {
    text: "Hello, this is a test of the voice assistant. Welcome to SmartStudy Copilot!",
    options: {
        voice: "educational",
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        emotion: "friendly",
        language: "en-US"
    }
};

const testVoiceQuiz = {
    topic: "Mathematics",
    difficulty: "medium",
    count: 3
};

let authToken = null;

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        // Handle binary responses (audio files)
        if (response.headers.get('content-type')?.includes('audio/')) {
            const buffer = await response.buffer();
            return { 
                response, 
                data: { 
                    audioData: buffer,
                    contentType: response.headers.get('content-type'),
                    contentLength: response.headers.get('content-length'),
                    duration: response.headers.get('x-audio-duration')
                }
            };
        }
        
        const data = await response.json();
        return { response, data };
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        return { response: null, data: null };
    }
}

// Test functions
async function testVoiceStatus() {
    console.log('\n=== Testing Voice Assistant Status ===');
    const { data } = await apiCall('/api/voice/status');
    
    if (data && data.status) {
        console.log('✅ Voice assistant status retrieved successfully');
        console.log('Status:', JSON.stringify(data.status, null, 2));
    } else {
        console.log('❌ Failed to get voice assistant status');
    }
}

async function testVoiceCommand() {
    console.log('\n=== Testing Voice Command Processing ===');
    
    // First, we need to authenticate
    if (!authToken) {
        console.log('⚠️  No auth token available. Skipping voice command test.');
        return;
    }
    
    const { data } = await apiCall('/api/voice/command', {
        method: 'POST',
        body: JSON.stringify(testVoiceCommand)
    });
    
    if (data && data.result) {
        console.log('✅ Voice command processed successfully');
        console.log('Command:', data.result.command);
        console.log('Response:', data.result.response);
        console.log('Speech available:', data.result.speech?.success || false);
    } else {
        console.log('❌ Failed to process voice command');
        if (data) console.log('Error:', data.error);
    }
}

async function testTextToSpeech() {
    console.log('\n=== Testing Text-to-Speech ===');
    
    if (!authToken) {
        console.log('⚠️  No auth token available. Skipping text-to-speech test.');
        return;
    }
    
    const { data } = await apiCall('/api/voice/synthesize', {
        method: 'POST',
        body: JSON.stringify(testTextToSpeak)
    });
    
    if (data && data.audioData) {
        console.log('✅ Text-to-speech synthesis successful');
        console.log('Audio data size:', data.audioData.length, 'bytes');
        console.log('Content type:', data.contentType);
        console.log('Duration:', data.duration, 'seconds');
        
        // Save audio file for testing
        const fs = require('fs');
        fs.writeFileSync('test-audio.wav', data.audioData);
        console.log('💾 Audio saved as test-audio.wav');
    } else {
        console.log('❌ Failed to synthesize speech');
        if (data) console.log('Error:', data.error);
    }
}

async function testVoiceQuiz() {
    console.log('\n=== Testing Voice Quiz Generation ===');
    
    if (!authToken) {
        console.log('⚠️  No auth token available. Skipping voice quiz test.');
        return;
    }
    
    const { data } = await apiCall('/api/voice/quiz', {
        method: 'POST',
        body: JSON.stringify(testVoiceQuiz)
    });
    
    if (data && data.result) {
        console.log('✅ Voice quiz generated successfully');
        console.log('Topic:', data.result.topic);
        console.log('Difficulty:', data.result.difficulty);
        console.log('Number of questions:', data.result.questions.length);
        
        data.result.questions.forEach((q, i) => {
            console.log(`Question ${i + 1}: ${q.question}`);
            console.log(`Answer: ${q.answer}`);
        });
    } else {
        console.log('❌ Failed to generate voice quiz');
        if (data) console.log('Error:', data.error);
    }
}

async function testWebSocketConnection() {
    console.log('\n=== Testing WebSocket Connection ===');
    
    try {
        const WebSocket = require('ws');
        const ws = new WebSocket(`ws://localhost:3000`);
        
        ws.on('open', () => {
            console.log('✅ WebSocket connected successfully');
            
            // Test voice command via WebSocket
            ws.send(JSON.stringify({
                type: 'voice_command',
                command: 'What is the capital of France?',
                context: {
                    userLevel: 'high-school',
                    subject: 'geography'
                }
            }));
        });
        
        ws.on('message', (data) => {
            const message = JSON.parse(data);
            console.log('📨 WebSocket message received:', message.type);
            
            if (message.type === 'voice_response') {
                console.log('✅ Voice response received via WebSocket');
                console.log('Response:', message.data.response);
            }
            
            // Close connection after receiving response
            setTimeout(() => {
                ws.close();
            }, 1000);
        });
        
        ws.on('error', (error) => {
            console.log('❌ WebSocket error:', error.message);
        });
        
        ws.on('close', () => {
            console.log('🔌 WebSocket connection closed');
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }, 5000);
        
    } catch (error) {
        console.log('❌ WebSocket test failed:', error.message);
    }
}

async function testAuthentication() {
    console.log('\n=== Testing Authentication for Voice Features ===');
    
    // Try to login with test user
    const { data } = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'teststudent',
            password: 'testpassword123'
        })
    });
    
    if (data && data.token) {
        authToken = data.token;
        console.log('✅ Authentication successful');
        console.log('User:', data.user.username);
        console.log('Role:', data.user.role);
    } else {
        console.log('⚠️  Authentication failed, some tests will be skipped');
        console.log('You can create a test user by running the main test script first');
    }
}

// Main test runner
async function runVoiceTests() {
    console.log('🎤 Starting Voice Assistant Tests\n');
    
    try {
        // Test authentication first
        await testAuthentication();
        
        // Test voice assistant status
        await testVoiceStatus();
        
        // Test voice command processing (requires auth)
        await testVoiceCommand();
        
        // Test text-to-speech (requires auth)
        await testTextToSpeech();
        
        // Test voice quiz generation (requires auth)
        await testVoiceQuiz();
        
        // Test WebSocket connection
        await testWebSocketConnection();
        
        console.log('\n✅ All voice assistant tests completed!');
        
    } catch (error) {
        console.error('\n❌ Voice assistant test suite failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runVoiceTests();
}

module.exports = {
    apiCall,
    testVoiceStatus,
    testVoiceCommand,
    testTextToSpeech,
    testVoiceQuiz,
    testWebSocketConnection,
    testAuthentication,
    runVoiceTests
}; 