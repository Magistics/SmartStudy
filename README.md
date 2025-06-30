# SmartStudy Copilot - AI-Powered Learning Platform

## 🚀 Overview

SmartStudy Copilot is a multi-level, real-time tutoring platform that leverages artificial intelligence to provide personalized learning experiences. The platform offers adaptive explanations, generates customized quizzes, and provides comprehensive progress tracking for students, teachers, and parents.

## ✨ Features

### Core Features
- **Multi-Level AI Tutor**: Get explanations at kid, high-school, or advanced levels
- **Personalized Quiz Generation**: AI-generated quizzes that adapt to learning level and focus areas
- **Step-by-Step Problem Solving**: Detailed solutions with explanations and related concepts
- **Study Materials Management**: Upload and organize educational content with RAG pipeline
- **Progress Tracking**: Comprehensive analytics and learning insights
- **Parent Updates**: Automated progress reports and learning gap identification
- **Voice Assistant**: OmniDimension-powered voice recognition and text-to-speech for hands-free learning

### Advanced Learning Features
- **Adaptive Difficulty**: Quiz difficulty adjusts based on performance
- **Real-time RAG Pipeline**: Instant updates when new materials are uploaded
- **Voice Updates**: Audio progress reports for parents
- **Multi-Subject Support**: Mathematics, Science, History, English, and more
- **Grade-Level Customization**: Content tailored to specific educational levels
- **Voice-Enabled Learning**: Speak questions, get voice responses, and take voice quizzes

### Progress Analytics
- Quiz performance tracking
- Learning time monitoring
- Subject-wise progress analysis
- Achievement milestones

### Voice Assistant Features
- **Voice Recognition**: Speak questions and commands naturally
- **Text-to-Speech**: Listen to AI responses and explanations
- **Voice Quizzes**: Interactive voice-based quiz taking
- **Multi-language Support**: Voice recognition and synthesis in multiple languages
- **Voice Settings**: Customizable speed, pitch, and persona
- **Real-time Processing**: Instant voice command processing via WebSocket
- **Educational Personas**: Different voice styles for different learning contexts

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenAI API** - AI/ML capabilities for tutoring
- **OmniDimension API** - Voice recognition and text-to-speech
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Chart.js** - Data visualization
- **WebSocket** - Real-time voice communication

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with Tailwind CSS
- **JavaScript (ES6+)** - Interactivity
- **Chart.js** - Interactive charts
- **Web Speech API** - Browser-based speech recognition and synthesis
- **Responsive Design** - Mobile-first approach

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartstudy-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   OMNIDIM_API_KEY=your_omnidim_api_key_here
   OMNIDIM_BASE_URL=https://api.omnidimension.ai
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   VOICE_ASSISTANT_ENABLED=true
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🎯 Usage

### For Students
1. **AI Tutoring**: Ask questions and get explanations at your level
2. **Problem Solving**: Submit problems for step-by-step solutions
3. **Take Quizzes**: Practice with personalized quizzes
4. **Track Progress**: Monitor your learning journey
5. **Voice Learning**: Use voice commands to ask questions and get spoken responses
6. **Voice Quizzes**: Take interactive voice quizzes with spoken questions and answers

### For Teachers
1. **Upload Materials**: Share study materials and notes
2. **Monitor Progress**: Track student performance and engagement
3. **Generate Quizzes**: Create customized assessments
4. **Provide Support**: Use AI insights to identify learning gaps
5. **Voice Integration**: Create voice-enabled learning experiences

### For Parents
1. **Progress Updates**: Receive automated progress reports
2. **Learning Insights**: Understand your child's strengths and areas for improvement
3. **Stay Informed**: Get voice updates about learning activities
4. **Support Learning**: Access recommendations for home support
5. **Voice Reports**: Listen to audio progress summaries

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration (student/teacher/parent)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### AI Tutoring
- `POST /api/tutor/explain` - Get multi-level explanations
- `POST /api/tutor/solve` - Solve problems step-by-step

### Quiz Management
- `POST /api/quiz/generate` - Generate personalized quizzes
- `POST /api/quiz/submit` - Submit quiz answers and get results

### Study Materials
- `POST /api/materials/upload` - Upload study materials
- `GET /api/materials` - Retrieve study materials with filtering

### Progress Tracking
- `GET /api/progress/:studentId` - Get student progress analytics

### Parent Updates
- `POST /api/parent/update` - Generate parent progress update
- `GET /api/parent/updates/:studentId` - Get parent updates

### Voice Assistant
- `GET /api/voice/status` - Get voice assistant status
- `POST /api/voice/command` - Process voice command and get AI response
- `POST /api/voice/synthesize` - Convert text to speech
- `POST /api/voice/quiz` - Generate voice-friendly quiz questions
- WebSocket: Real-time voice interaction

## 🔧 Configuration

### Environment Variables
- `