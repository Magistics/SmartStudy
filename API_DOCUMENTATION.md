# Customer Feedback AI Enhanced Platform - API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /api/health
Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

### Authentication

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Feedback Management

#### POST /api/feedback
Submit new customer feedback with AI analysis.

**Request Body:**
```json
{
  "feedback": "I love the new interface! It's much more intuitive than before.",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "category": "product"
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": 1,
    "feedback": "I love the new interface! It's much more intuitive than before.",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "category": "product",
    "sentiment": "positive",
    "confidence": 0.85,
    "insights": [
      "Customer expresses satisfaction with interface improvements",
      "Positive sentiment towards product usability"
    ],
    "suggestedResponse": "Thank you for your positive feedback! We're glad you find the new interface intuitive.",
    "priority": 2,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "analysis": {
    "sentiment": "positive",
    "category": "product",
    "confidence": 0.85,
    "insights": [...],
    "suggestedResponse": "...",
    "priority": 2
  }
}
```

#### GET /api/feedback
Retrieve feedback with pagination and filtering. **Requires authentication.**

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sentiment` (optional): Filter by sentiment (positive, negative, neutral)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (pending, in-progress, resolved, closed)

**Response:**
```json
{
  "feedback": [
    {
      "id": 1,
      "feedback": "I love the new interface!",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "category": "product",
      "sentiment": "positive",
      "confidence": 0.85,
      "insights": [...],
      "suggestedResponse": "...",
      "priority": 2,
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### GET /api/feedback/:id
Retrieve a specific feedback entry by ID. **Requires authentication.**

**Response:**
```json
{
  "id": 1,
  "feedback": "I love the new interface!",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "category": "product",
  "sentiment": "positive",
  "confidence": 0.85,
  "insights": [...],
  "suggestedResponse": "...",
  "priority": 2,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### PUT /api/feedback/:id
Update a feedback entry. **Requires authentication.**

**Request Body:**
```json
{
  "status": "resolved",
  "response": "Thank you for your feedback. We've implemented the suggested improvements.",
  "priority": 3
}
```

**Response:**
```json
{
  "message": "Feedback updated successfully",
  "feedback": {
    "id": 1,
    "feedback": "I love the new interface!",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "category": "product",
    "sentiment": "positive",
    "confidence": 0.85,
    "insights": [...],
    "suggestedResponse": "...",
    "priority": 3,
    "status": "resolved",
    "response": "Thank you for your feedback. We've implemented the suggested improvements.",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Analytics

#### GET /api/analytics
Retrieve analytics data. **Requires authentication.**

**Query Parameters:**
- `period` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "overview": {
    "totalFeedback": 150,
    "averagePriority": 2.8,
    "csatScore": 78.5
  },
  "sentimentDistribution": {
    "positive": 95,
    "negative": 25,
    "neutral": 30
  },
  "categoryDistribution": {
    "product": 45,
    "service": 35,
    "support": 40,
    "pricing": 20,
    "general": 10
  },
  "dailyTrends": [
    {
      "date": "2024-01-15",
      "positive": 5,
      "negative": 1,
      "neutral": 2
    }
  ],
  "recentActivity": [
    {
      "id": 1,
      "feedback": "I love the new interface!",
      "customerName": "John Doe",
      "category": "product",
      "sentiment": "positive",
      "priority": 2,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Export

#### GET /api/export/csv
Export feedback data as CSV. **Requires authentication.**

**Response:**
- Content-Type: `text/csv`
- File download with feedback data

**CSV Format:**
```csv
ID,Feedback,Customer Name,Email,Category,Sentiment,Priority,Status,Created At
1,"I love the new interface!","John Doe","john@example.com","product","positive",2,"pending","2024-01-15T10:30:00.000Z"
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Feedback text is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Feedback not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Data Models

### User
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Feedback
```json
{
  "id": 1,
  "feedback": "Customer feedback text",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "category": "product|service|support|pricing|general",
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "insights": ["Key insight 1", "Key insight 2"],
  "suggestedResponse": "AI-generated response suggestion",
  "priority": 1-5,
  "status": "pending|in-progress|resolved|closed",
  "response": "Manual response from staff",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

## WebSocket Events (Future Enhancement)
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Listen for real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'feedback_received':
      // New feedback submitted
      break;
    case 'feedback_updated':
      // Feedback status changed
      break;
    case 'analytics_updated':
      // Analytics data updated
      break;
  }
};
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Submit feedback
const feedback = await api.post('/feedback', {
  feedback: 'Great product!',
  customerName: 'John Doe',
  category: 'product'
});

// Get analytics
const analytics = await api.get('/analytics?period=30');
```

### Python
```python
import requests

BASE_URL = 'http://localhost:3000/api'
headers = {'Authorization': f'Bearer {token}'}

# Submit feedback
response = requests.post(f'{BASE_URL}/feedback', json={
    'feedback': 'Great product!',
    'customerName': 'John Doe',
    'category': 'product'
}, headers=headers)

# Get analytics
analytics = requests.get(f'{BASE_URL}/analytics?period=30', headers=headers)
```

### cURL Examples
```bash
# Submit feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Great product!", "customerName": "John Doe"}'

# Get feedback (with auth)
curl -X GET http://localhost:3000/api/feedback \
  -H "Authorization: Bearer YOUR_TOKEN"

# Export CSV
curl -X GET http://localhost:3000/api/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o feedback-export.csv
```

### Parent Updates
- `POST /api/parent/update` - Generate parent progress update
- `GET /api/parent/updates/:studentId` - Get parent updates

### Voice Assistant

#### GET /api/voice/status
Get the current status of the voice assistant. **No authentication required.**

**Response:**
```json
{
  "message": "Voice assistant status retrieved",
  "status": {
    "enabled": true,
    "omnidimEnabled": true,
    "apiKeyConfigured": true,
    "recognitionLanguage": "en-US",
    "speechLanguage": "en-US",
    "voicePersona": "educational"
  }
}
```

#### POST /api/voice/command
Process a voice command and generate an AI response. **Requires authentication.**

**Request Body:**
```json
{
  "command": "What is photosynthesis?",
  "context": {
    "userLevel": "high-school",
    "subject": "science",
    "previousContext": "Learning about plant biology"
  }
}
```

**Response:**
```json
{
  "message": "Voice command processed successfully",
  "result": {
    "success": true,
    "command": "What is photosynthesis?",
    "response": "Photosynthesis is the process by which plants convert sunlight into energy...",
    "speech": {
      "success": true,
      "audio": "base64_encoded_audio_data",
      "format": "wav",
      "duration": "15.2"
    },
    "context": {
      "userLevel": "high-school",
      "subject": "science",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### POST /api/voice/synthesize
Convert text to speech using OmniDimension. **Requires authentication.**

**Request Body:**
```json
{
  "text": "Hello, this is a test of text-to-speech synthesis.",
  "options": {
    "voice": "educational",
    "speed": 1.0,
    "pitch": 1.0,
    "volume": 1.0,
    "emotion": "friendly",
    "language": "en-US"
  }
}
```

**Response:**
- Content-Type: `audio/wav`
- Audio file data as binary stream
- Headers:
  - `X-Audio-Duration`: Duration in seconds
  - `Content-Length`: Size of audio data

#### POST /api/voice/quiz
Generate voice-friendly quiz questions. **Requires authentication.**

**Request Body:**
```json
{
  "topic": "Mathematics",
  "difficulty": "medium",
  "count": 5
}
```

**Response:**
```json
{
  "message": "Voice quiz generated successfully",
  "result": {
    "success": true,
    "topic": "Mathematics",
    "difficulty": "medium",
    "questions": [
      {
        "question": "What is the square root of 16?",
        "answer": "4"
      },
      {
        "question": "What is 5 times 7?",
        "answer": "35"
      }
    ]
  }
}
```

## WebSocket Events

### Voice Assistant WebSocket
Connect to `ws://localhost:3000` for real-time voice interaction.

**Message Types:**

#### voice_command
Send a voice command for processing:
```json
{
  "type": "voice_command",
  "command": "Explain quantum physics",
  "context": {
    "userLevel": "advanced",
    "subject": "physics"
  }
}
```

#### speech_recognition
Send audio data for speech recognition:
```json
{
  "type": "speech_recognition",
  "audio": "base64_encoded_audio_data",
  "options": {
    "language": "en-US",
    "interim_results": true,
    "continuous": false
  }
}
```

#### generate_voice_quiz
Request voice quiz generation:
```json
{
  "type": "generate_voice_quiz",
  "topic": "History",
  "difficulty": "easy",
  "count": 3
}
```

**Response Messages:**

#### voice_response
```json
{
  "type": "voice_response",
  "data": {
    "success": true,
    "command": "Explain quantum physics",
    "response": "Quantum physics is a fundamental theory...",
    "speech": {
      "success": true,
      "audio": "base64_encoded_audio_data",
      "format": "wav"
    }
  }
}
```

#### recognition_result
```json
{
  "type": "recognition_result",
  "data": {
    "success": true,
    "text": "What is photosynthesis?",
    "confidence": 0.95,
    "language": "en-US",
    "interim": false
  }
}
```

#### voice_quiz
```json
{
  "type": "voice_quiz",
  "data": {
    "success": true,
    "topic": "History",
    "difficulty": "easy",
    "questions": [
      {
        "question": "Who was the first president of the United States?",
        "answer": "George Washington"
      }
    ]
  }
}
```

## Error Responses