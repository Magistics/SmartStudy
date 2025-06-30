const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

// Import voice assistant
const VoiceAssistant = require('./services/voiceAssistant');

// Import Firebase service
const FirebaseService = require('./services/firebase');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize voice assistant
const voiceAssistant = new VoiceAssistant();
let voiceWebSocket = null;

// Initialize Firebase service
const firebaseService = new FirebaseService();
let firebaseInitialized = false;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage (in production, use a database)
const users = [];
const studyMaterials = [];
const quizzes = [];
const studentProgress = [];
const parentUpdates = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/study-materials';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Mock AI Tutor (replace with actual OpenAI integration)
const smartStudyAI = {
  // Multi-level explanations
  explainTopic: async (topic, level = 'high-school', context = '') => {
    const levels = {
      'kid': 'simple and fun language with examples a child would understand',
      'high-school': 'clear explanations with relevant examples and step-by-step breakdown',
      'advanced': 'detailed technical explanations with advanced concepts and applications'
    };
    
    const levelDescription = levels[level] || levels['high-school'];
    
    return {
      explanation: `Here's a ${level} level explanation of ${topic}: [AI-generated explanation would go here]`,
      examples: [
        `Example 1: [${level} appropriate example]`,
        `Example 2: [${level} appropriate example]`
      ],
      keyPoints: [
        `Key point 1 about ${topic}`,
        `Key point 2 about ${topic}`,
        `Key point 3 about ${topic}`
      ],
      difficulty: level,
      estimatedTime: Math.floor(Math.random() * 10) + 5 // 5-15 minutes
    };
  },

  // Generate personalized quizzes
  generateQuiz: async (topic, difficulty = 'medium', focusArea = '', studentLevel = 'high-school') => {
    const questionTypes = ['multiple-choice', 'true-false', 'short-answer', 'problem-solving'];
    const questions = [];
    
    for (let i = 0; i < 5; i++) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      questions.push({
        id: i + 1,
        type: questionType,
        question: `Question ${i + 1} about ${topic} (${difficulty} level)`,
        options: questionType === 'multiple-choice' ? 
          ['Option A', 'Option B', 'Option C', 'Option D'] : null,
        correctAnswer: questionType === 'multiple-choice' ? 'Option A' : 'Correct answer here',
        explanation: `Explanation for question ${i + 1}`,
        difficulty: difficulty,
        focusArea: focusArea
      });
    }
    
    return {
      id: Date.now(),
      topic: topic,
      difficulty: difficulty,
      focusArea: focusArea,
      questions: questions,
      timeLimit: 15, // minutes
      passingScore: 70
    };
  },

  // Step-by-step problem solving
  solveProblem: async (problem, steps = true) => {
    return {
      solution: `Complete solution to: ${problem}`,
      steps: steps ? [
        'Step 1: Understand the problem',
        'Step 2: Identify key concepts',
        'Step 3: Apply relevant formulas',
        'Step 4: Solve step by step',
        'Step 5: Verify the answer'
      ] : null,
      explanation: `Detailed explanation of the solution process`,
      relatedConcepts: ['Concept 1', 'Concept 2', 'Concept 3']
    };
  },

  // Generate parent updates
  generateParentUpdate: async (studentId, progress) => {
    return {
      studentId: studentId,
      timestamp: new Date(),
      summary: `Progress update for student ${studentId}`,
      achievements: [
        'Completed 5 quizzes successfully',
        'Improved in problem-solving skills',
        'Showed good understanding of core concepts'
      ],
      areasForImprovement: [
        'Needs more practice with advanced topics',
        'Could benefit from additional examples'
      ],
      recommendations: [
        'Continue with current study plan',
        'Focus on weak areas identified',
        'Consider additional practice materials'
      ],
      nextSteps: 'Continue with personalized learning path'
    };
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role = 'student', grade = '', subject = '' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Sign up with Firebase
    const result = await firebaseService.signUpWithEmail(email, password, {
      username,
      displayName: username,
      role,
      grade,
      subject
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Get user document from Firestore
    const userDoc = await firebaseService.getUserDocument(result.user.uid);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: result.user.uid,
        username: userDoc.data?.username || result.user.displayName,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: userDoc.data?.role || 'student',
        grade: userDoc.data?.grade || '',
        subject: userDoc.data?.subject || '',
        emailVerified: result.user.emailVerified
      },
      token: result.token,
      provider: result.provider
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Sign in with Firebase
    const result = await firebaseService.signInWithEmail(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Get user document from Firestore
    const userDoc = await firebaseService.getUserDocument(result.user.uid);
    
    res.json({
      message: 'Login successful',
      user: {
        uid: result.user.uid,
        username: userDoc.data?.username || result.user.displayName,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: userDoc.data?.role || 'student',
        grade: userDoc.data?.grade || '',
        subject: userDoc.data?.subject || '',
        emailVerified: result.user.emailVerified
      },
      token: result.token,
      provider: result.provider
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sign-In
app.post('/api/auth/google', async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Google sign-in is handled on the client side
    // This endpoint is for server-side verification
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the ID token
    const verificationResult = await firebaseService.verifyToken(idToken);
    
    if (!verificationResult.success) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = verificationResult.user;
    
    // Get user document from Firestore
    const userDoc = await firebaseService.getUserDocument(user.uid);
    
    // Create custom token for client
    const customToken = await firebaseService.adminApp.auth().createCustomToken(user.uid);
    
    res.json({
      message: 'Google sign-in successful',
      user: {
        uid: user.uid,
        username: userDoc.data?.username || user.name,
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
        role: userDoc.data?.role || 'student',
        grade: userDoc.data?.grade || '',
        subject: userDoc.data?.subject || '',
        emailVerified: user.email_verified
      },
      token: customToken,
      provider: 'google'
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password Reset
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const result = await firebaseService.sendPasswordResetEmail(email);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const userDoc = await firebaseService.getUserDocument(req.user.uid);
    
    if (!userDoc.success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        uid: req.user.uid,
        username: userDoc.data?.username || req.user.name,
        email: req.user.email,
        displayName: userDoc.data?.displayName || req.user.name,
        photoURL: userDoc.data?.photoURL || req.user.picture,
        role: userDoc.data?.role || 'student',
        grade: userDoc.data?.grade || '',
        subject: userDoc.data?.subject || '',
        emailVerified: req.user.email_verified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { username, displayName, role, grade, subject } = req.body;
    
    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (displayName) updateData.displayName = displayName;
    if (role) updateData.role = role;
    if (grade) updateData.grade = grade;
    if (subject) updateData.subject = subject;

    const result = await firebaseService.updateUserDocument(req.user.uid, updateData);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Get updated user document
    const userDoc = await firebaseService.getUserDocument(req.user.uid);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: req.user.uid,
        username: userDoc.data?.username,
        email: req.user.email,
        displayName: userDoc.data?.displayName,
        photoURL: userDoc.data?.photoURL,
        role: userDoc.data?.role,
        grade: userDoc.data?.grade,
        subject: userDoc.data?.subject,
        emailVerified: req.user.email_verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
app.post('/api/auth/signout', authenticateToken, async (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const result = await firebaseService.signOut();
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Firebase configuration for client
app.get('/api/auth/firebase-config', (req, res) => {
  try {
    if (!firebaseInitialized) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const config = firebaseService.getFirebaseConfig();
    res.json({ config });
  } catch (error) {
    console.error('Get Firebase config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Study Materials Management
app.post('/api/materials/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const material = {
      id: studyMaterials.length + 1,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id,
      subject: req.body.subject || 'General',
      topic: req.body.topic || 'General',
      grade: req.body.grade || 'All',
      uploadedAt: new Date(),
      type: req.file.mimetype
    };

    studyMaterials.push(material);

    res.status(201).json({
      message: 'Study material uploaded successfully',
      material: {
        id: material.id,
        filename: material.filename,
        originalName: material.originalName,
        subject: material.subject,
        topic: material.topic,
        grade: material.grade,
        uploadedAt: material.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/api/materials', authenticateToken, (req, res) => {
  try {
    const { subject, topic, grade } = req.query;
    let filteredMaterials = [...studyMaterials];

    if (subject) {
      filteredMaterials = filteredMaterials.filter(m => m.subject === subject);
    }
    if (topic) {
      filteredMaterials = filteredMaterials.filter(m => m.topic === topic);
    }
    if (grade) {
      filteredMaterials = filteredMaterials.filter(m => m.grade === grade);
    }

    res.json({
      materials: filteredMaterials.map(m => ({
        id: m.id,
        filename: m.filename,
        originalName: m.originalName,
        subject: m.subject,
        topic: m.topic,
        grade: m.grade,
        uploadedAt: m.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to retrieve materials' });
  }
});

// AI Tutoring Routes
app.post('/api/tutor/explain', authenticateToken, async (req, res) => {
  try {
    const { topic, level = 'high-school', context = '' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const explanation = await smartStudyAI.explainTopic(topic, level, context);
    
    res.json({
      message: 'Explanation generated successfully',
      explanation
    });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

app.post('/api/tutor/solve', authenticateToken, async (req, res) => {
  try {
    const { problem, steps = true } = req.body;
    
    if (!problem) {
      return res.status(400).json({ error: 'Problem is required' });
    }

    const solution = await smartStudyAI.solveProblem(problem, steps);
    
    res.json({
      message: 'Solution generated successfully',
      solution
    });
  } catch (error) {
    console.error('Solution error:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

// Quiz Generation and Management
app.post('/api/quiz/generate', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', focusArea = '', studentLevel = 'high-school' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const quiz = await smartStudyAI.generateQuiz(topic, difficulty, focusArea, studentLevel);
    quizzes.push(quiz);
    
    res.json({
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post('/api/quiz/submit', authenticateToken, (req, res) => {
  try {
    const { quizId, answers } = req.body;
    
    if (!quizId || !answers) {
      return res.status(400).json({ error: 'Quiz ID and answers are required' });
    }

    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = quiz.questions.map(question => {
      const isCorrect = answers[question.id] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionId: question.id,
        userAnswer: answers[question.id],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    // Store progress
    const progress = {
      id: studentProgress.length + 1,
      studentId: req.user.id,
      quizId: quizId,
      score: score,
      passed: passed,
      answers: results,
      completedAt: new Date()
    };
    studentProgress.push(progress);

    res.json({
      message: 'Quiz submitted successfully',
      results: {
        score: score,
        passed: passed,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctAnswers,
        details: results
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Progress Tracking
app.get('/api/progress/:studentId', authenticateToken, (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const progress = studentProgress.filter(p => p.studentId === studentId);
    
    const analytics = {
      totalQuizzes: progress.length,
      averageScore: progress.length > 0 ? 
        progress.reduce((sum, p) => sum + p.score, 0) / progress.length : 0,
      passedQuizzes: progress.filter(p => p.passed).length,
      recentActivity: progress.slice(-5)
    };

    res.json({
      progress: analytics,
      detailedProgress: progress
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Failed to retrieve progress' });
  }
});

// Parent Updates
app.post('/api/parent/update', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const studentProgressData = studentProgress.filter(p => p.studentId === studentId);
    const update = await smartStudyAI.generateParentUpdate(studentId, studentProgressData);
    
    parentUpdates.push(update);
    
    res.json({
      message: 'Parent update generated successfully',
      update
    });
  } catch (error) {
    console.error('Parent update error:', error);
    res.status(500).json({ error: 'Failed to generate parent update' });
  }
});

app.get('/api/parent/updates/:studentId', authenticateToken, (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const updates = parentUpdates.filter(u => u.studentId === studentId);
    
    res.json({
      updates: updates
    });
  } catch (error) {
    console.error('Get parent updates error:', error);
    res.status(500).json({ error: 'Failed to retrieve parent updates' });
  }
});

// Voice Assistant Routes
app.get('/api/voice/status', (req, res) => {
  try {
    const status = voiceAssistant.getStatus();
    res.json({
      message: 'Voice assistant status retrieved',
      status
    });
  } catch (error) {
    console.error('Voice status error:', error);
    res.status(500).json({ error: 'Failed to get voice assistant status' });
  }
});

app.post('/api/voice/command', authenticateToken, async (req, res) => {
  try {
    const { command, context = {} } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Voice command is required' });
    }

    const result = await voiceAssistant.processVoiceCommand(command, {
      ...context,
      userLevel: req.user.grade || 'high-school',
      subject: req.user.subject || 'general'
    });
    
    res.json({
      message: 'Voice command processed successfully',
      result
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({ error: 'Failed to process voice command' });
  }
});

app.post('/api/voice/synthesize', authenticateToken, async (req, res) => {
  try {
    const { text, options = {} } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required for speech synthesis' });
    }

    const result = await voiceAssistant.synthesizeSpeech(text, options);
    
    if (result.success) {
      res.set({
        'Content-Type': 'audio/wav',
        'Content-Length': result.audio.length,
        'X-Audio-Duration': result.duration || '0'
      });
      res.send(Buffer.from(result.audio));
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Speech synthesis error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

app.post('/api/voice/quiz', authenticateToken, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 3 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for voice quiz' });
    }

    const result = await voiceAssistant.generateVoiceQuiz(topic, difficulty, count);
    
    res.json({
      message: 'Voice quiz generated successfully',
      result
    });
  } catch (error) {
    console.error('Voice quiz error:', error);
    res.status(500).json({ error: 'Failed to generate voice quiz' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    service: 'SmartStudy Copilot',
    voiceAssistant: voiceAssistant.getStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize voice assistant and start server
async function startServer() {
  try {
    // Initialize voice assistant
    const voiceInitialized = await voiceAssistant.initialize();
    
    if (voiceInitialized) {
      // Create WebSocket for real-time voice interaction
      voiceWebSocket = voiceAssistant.createVoiceWebSocket(server);
      console.log('🎤 Voice WebSocket server initialized');
    }

    // Start HTTP server
    server.listen(port, () => {
      console.log(`🚀 SmartStudy Copilot Server running at http://localhost:${port}`);
      console.log(`📚 Learning Dashboard: http://localhost:${port}`);
      console.log(`🔧 Health Check: http://localhost:${port}/api/health`);
      console.log(`🎤 Voice Assistant: ${voiceInitialized ? 'Enabled' : 'Disabled'}`);
      if (voiceInitialized) {
        console.log(`🔊 Voice WebSocket: ws://localhost:${port}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;