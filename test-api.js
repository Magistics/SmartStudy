// SmartStudy Copilot - API Test Script
// This script demonstrates the API functionality

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testExplanation = {
    topic: "Photosynthesis",
    level: "high-school",
    context: "Learning about plant biology"
};

const testProblem = {
    problem: "Solve for x: 2x + 5 = 13",
    steps: true
};

const testQuiz = {
    topic: "Algebra",
    difficulty: "medium",
    focusArea: "Linear equations",
    studentLevel: "high-school"
};

const testUser = {
    username: "teststudent",
    email: "student@example.com",
    password: "testpassword123",
    role: "student",
    grade: "High School",
    subject: "Mathematics"
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
        const data = await response.json();
        
        console.log(`\n${options.method || 'GET'} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        return { response, data };
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        return { response: null, data: null };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    await apiCall('/api/health');
}

async function testUserSignup() {
    console.log('\n=== Testing User Signup ===');
    const { data } = await apiCall('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });
    
    if (data && data.token) {
        authToken = data.token;
        console.log('✅ Signup successful, token received');
    }
}

async function testUserLogin() {
    console.log('\n=== Testing User Login ===');
    const { data } = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: testUser.username,
            password: testUser.password
        })
    });
    
    if (data && data.token) {
        authToken = data.token;
        console.log('✅ Login successful, token received');
    }
}

async function testExplanation() {
    console.log('\n=== Testing AI Explanation ===');
    const { data } = await apiCall('/api/tutor/explain', {
        method: 'POST',
        body: JSON.stringify(testExplanation)
    });
    
    if (data && data.message) {
        console.log('✅ Explanation generated successfully');
    }
}

async function testProblemSolving() {
    console.log('\n=== Testing Problem Solving ===');
    const { data } = await apiCall('/api/tutor/solve', {
        method: 'POST',
        body: JSON.stringify(testProblem)
    });
    
    if (data && data.message) {
        console.log('✅ Problem solved successfully');
    }
}

async function testQuizGeneration() {
    console.log('\n=== Testing Quiz Generation ===');
    const { data } = await apiCall('/api/quiz/generate', {
        method: 'POST',
        body: JSON.stringify(testQuiz)
    });
    
    if (data && data.quiz) {
        console.log('✅ Quiz generated successfully');
        return data.quiz.id;
    }
    return null;
}

async function testQuizSubmission() {
    console.log('\n=== Testing Quiz Submission ===');
    const quizId = await testQuizGeneration();
    
    if (quizId) {
        const answers = {
            1: "Option A",
            2: "True",
            3: "x = 4",
            4: "Option B",
            5: "False"
        };
        
        const { data } = await apiCall('/api/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({
                quizId: quizId,
                answers: answers
            })
        });
        
        if (data && data.results) {
            console.log('✅ Quiz submitted successfully');
            console.log(`Score: ${data.results.score}%`);
        }
    }
}

async function testProgressTracking() {
    console.log('\n=== Testing Progress Tracking ===');
    await apiCall(`/api/progress/${testUser.id || 1}`);
}

async function testParentUpdate() {
    console.log('\n=== Testing Parent Update ===');
    const { data } = await apiCall('/api/parent/update', {
        method: 'POST',
        body: JSON.stringify({
            studentId: testUser.id || 1
        })
    });
    
    if (data && data.update) {
        console.log('✅ Parent update generated successfully');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting SmartStudy Copilot API Tests\n');
    
    try {
        // Test health check
        await testHealthCheck();
        
        // Test user signup
        await testUserSignup();
        
        // Test user login (in case signup fails)
        if (!authToken) {
            await testUserLogin();
        }
        
        // Test AI tutoring features
        await testExplanation();
        await testProblemSolving();
        
        // Test quiz features
        await testQuizSubmission();
        
        // Test progress and parent updates (requires authentication)
        if (authToken) {
            await testProgressTracking();
            await testParentUpdate();
        }
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    apiCall,
    testHealthCheck,
    testUserSignup,
    testUserLogin,
    testExplanation,
    testProblemSolving,
    testQuizGeneration,
    testQuizSubmission,
    testProgressTracking,
    testParentUpdate,
    runTests
}; 