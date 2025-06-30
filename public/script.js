// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let charts = {};
let currentQuiz = null;

// Firebase variables
let firebaseApp = null;
let firebaseAuth = null;
let firebaseConfig = null;
let googleProvider = null;

// Theme
let currentTheme = localStorage.getItem('theme') || 'light';

// Voice Assistant variables
let voiceWebSocket = null;
let recognition = null;
let synthesis = null;
let isListening = false;
let isSpeaking = false;
let voiceQuizData = null;
let currentVoiceQuestion = 0;

// Modern JavaScript for SmartStudy Copilot

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupThemeToggle();
    setupSmoothScrolling();
    setupAnimations();
    setupNavigation();
    setupInteractiveElements();
}

// Theme Toggle Functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.classList.toggle('dark', savedTheme === 'dark');
    
    // Update toggle button icon
    updateThemeIcon();
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon();
        
        // Add animation class
        themeToggle.classList.add('rotating');
        setTimeout(() => {
            themeToggle.classList.remove('rotating');
        }, 500);
    });
}

// Update theme toggle icon
function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    const isDark = document.documentElement.classList.contains('dark');
    
    const moonIcon = themeToggle.querySelector('.fa-moon');
    const sunIcon = themeToggle.querySelector('.fa-sun');
    
    if (isDark) {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    } else {
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
}

// Smooth Scrolling for Navigation Links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active navigation
                updateActiveNavigation(targetId);
            }
        });
    });
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Setup Animations
function setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .card, .section');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // Stagger animations for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Setup Navigation
function setupNavigation() {
    // Update active navigation on scroll
    window.addEventListener('scroll', updateActiveNavigation);
    
    // Mobile menu toggle (if needed)
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            this.classList.toggle('active');
        });
    }
}

// Setup Interactive Elements
function setupInteractiveElements() {
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Card hover effects
    const cards = document.querySelectorAll('.card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Form interactions
    setupFormInteractions();
}

// Setup Form Interactions
function setupFormInteractions() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Focus effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
}

// Field Validation
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    let isValid = true;
    let errorMessage = '';
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Password validation
    if (fieldType === 'password' && value) {
        if (value.length < 8) {
            isValid = false;
            errorMessage = 'Password must be at least 8 characters long';
        }
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Update field status
    updateFieldStatus(field, isValid, errorMessage);
}

// Update Field Status
function updateFieldStatus(field, isValid, errorMessage) {
    const fieldContainer = field.parentElement;
    const existingError = fieldContainer.querySelector('.error-message');
    
    // Remove existing error message
    if (existingError) {
        existingError.remove();
    }
    
    // Remove existing status classes
    fieldContainer.classList.remove('valid', 'invalid');
    
    if (field.value.trim()) {
        if (isValid) {
            fieldContainer.classList.add('valid');
        } else {
            fieldContainer.classList.add('invalid');
            
            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message text-red-500 text-sm mt-1';
            errorElement.textContent = errorMessage;
            fieldContainer.appendChild(errorElement);
        }
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading state management
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// API call wrapper
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('An error occurred. Please try again.', 'error');
        throw error;
    }
}

// Local storage utilities
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
};

// Export functions for global use
window.SmartStudy = {
    showNotification,
    setLoadingState,
    apiCall,
    storage,
    scrollToTop
};

// Performance optimization: Throttle scroll events
window.addEventListener('scroll', throttle(updateActiveNavigation, 100));

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Recalculate any layout-dependent elements
    updateActiveNavigation();
}, 250));

// Dynamically load Firebase SDK
function loadFirebaseSdk(callback) {
  if (window.firebase) return callback();
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js';
  script.onload = () => {
    const authScript = document.createElement('script');
    authScript.src = 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js';
    authScript.onload = callback;
    document.body.appendChild(authScript);
  };
  document.body.appendChild(script);
}

// Initialize Firebase from backend config
async function initializeFirebase() {
  if (firebaseApp) return;
  const res = await fetch('/api/auth/firebase-config');
  const { config } = await res.json();
  firebaseConfig = config;
  window.firebase.initializeApp(firebaseConfig);
  firebaseApp = window.firebase.app();
  firebaseAuth = window.firebase.auth();
  googleProvider = new window.firebase.auth.GoogleAuthProvider();
}

// Theme logic
function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  // Animate theme icon
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.classList.add('rotating');
    setTimeout(() => themeToggle.classList.remove('rotating'), 500);
  }
}

function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Animation for section transitions
function animateSection(section) {
  section.classList.remove('fade-in-up');
  void section.offsetWidth; // trigger reflow
  section.classList.add('fade-in-up');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SmartStudy Copilot initialized');
    
    // Initialize navbar as hidden
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        navbar.classList.add('nav-hidden');
    }
    
    // Check if user is already logged in
    if (authToken) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUIForLoggedInUser();
    }
    
    // Show home section by default
    showSection('home');
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize voice assistant
    initializeVoiceAssistant();
    
    setTheme(currentTheme); // Ensure theme is set on load
});

// Navigation functions
function showSection(sectionId) {
    const sections = ['home', 'tutor', 'quiz', 'materials', 'progress', 'parent', 'login', 'signup', 'voice'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('hidden');
        }
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        animateSection(targetSection);
    }
    
    // Update navigation buttons - highlight active section
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-active', 'active');
    });
    
    // Find and highlight the active nav button
    const activeNavBtn = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('nav-active', 'active');
    }
    
    // Special handling for sections that require authentication
    if (['progress', 'parent', 'materials'].includes(sectionId) && !currentUser) {
        showSection('login');
        showNotification('Please login to access this section', 'warning');
        return;
    }
    
    // Load data for specific sections
    if (sectionId === 'progress' && currentUser) {
        loadProgressData();
    } else if (sectionId === 'materials' && currentUser) {
        loadMaterials();
    } else if (sectionId === 'parent' && currentUser) {
        loadParentUpdates();
    }
    if (sectionId === 'voice') {
        loadVoiceSettings();
        loadVoiceStatus();
    }
}

// Navbar toggle functionality
function toggleNavbar() {
    const navbar = document.getElementById('mainNav');
    const toggleBtn = document.getElementById('navToggle');
    const toggleIcon = document.getElementById('navToggleIcon');
    
    if (navbar.classList.contains('nav-hidden')) {
        // Show navbar
        navbar.classList.remove('nav-hidden');
        navbar.classList.add('nav-visible');
        toggleIcon.classList.remove('fa-bars');
        toggleIcon.classList.add('fa-times');
        toggleBtn.classList.add('nav-open');
    } else {
        // Hide navbar
        navbar.classList.add('nav-hidden');
        navbar.classList.remove('nav-visible');
        toggleIcon.classList.remove('fa-times');
        toggleIcon.classList.add('fa-bars');
        toggleBtn.classList.remove('nav-open');
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

// Event listeners
function initializeEventListeners() {
    // Navbar toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.onclick = toggleNavbar;
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = toggleTheme;
    }
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = handleFirebaseLogin;
    }
    // Google login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.onclick = handleGoogleLogin;
    }
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = handleFirebaseSignup;
    }
    // Google signup
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
        googleSignupBtn.onclick = handleGoogleLogin;
    }
    // AI Tutor forms
    const explanationForm = document.getElementById('explanationForm');
    if (explanationForm) {
        explanationForm.addEventListener('submit', handleExplanationRequest);
    }
    
    const problemForm = document.getElementById('problemForm');
    if (problemForm) {
        problemForm.addEventListener('submit', handleProblemSolve);
    }
    
    // Quiz forms
    const quizForm = document.getElementById('quizForm');
    if (quizForm) {
        quizForm.addEventListener('submit', handleQuizGeneration);
    }
    
    // Study materials forms
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleMaterialUpload);
    }
    
    // Parent update form
    const parentUpdateForm = document.getElementById('parentUpdateForm');
    if (parentUpdateForm) {
        parentUpdateForm.addEventListener('submit', handleParentUpdate);
    }
}

// Firebase Email/Password Login
async function handleFirebaseLogin(e) {
    e.preventDefault();
    await loadFirebaseSdk(async () => {
        await initializeFirebase();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            const idToken = await userCredential.user.getIdToken();
            // Send token to backend for session
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                currentUser = data.user;
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
                showSection('home');
                showNotification('Login successful!', 'success');
            } else {
                showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Login failed', 'error');
        }
    });
}

// Firebase Email/Password Signup
async function handleFirebaseSignup(e) {
    e.preventDefault();
    await loadFirebaseSdk(async () => {
        await initializeFirebase();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;
        const grade = document.getElementById('signupGrade').value;
        const subject = document.getElementById('signupSubject').value;
        if (!username || !email || !password) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: username });
            const idToken = await userCredential.user.getIdToken();
            // Send to backend for user creation
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role, grade, subject })
            });
            const data = await response.json();
            if (response.ok) {
                currentUser = data.user;
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
                showSection('home');
                showNotification('Account created successfully!', 'success');
            } else {
                showNotification(data.error || 'Signup failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Signup failed', 'error');
        }
    });
}

// Google Sign-In (for both login and signup)
async function handleGoogleLogin(e) {
    e.preventDefault();
    await loadFirebaseSdk(async () => {
        await initializeFirebase();
        try {
            const result = await firebaseAuth.signInWithPopup(googleProvider);
            const idToken = await result.user.getIdToken();
            // Send ID token to backend for verification
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            });
            const data = await response.json();
            if (response.ok) {
                currentUser = data.user;
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
                showSection('home');
                showNotification('Google sign-in successful!', 'success');
            } else {
                showNotification(data.error || 'Google sign-in failed', 'error');
            }
        } catch (error) {
            showNotification(error.message || 'Google sign-in failed', 'error');
        }
    });
}

// UI update for login state
function updateUIForLoggedInUser() {
    // Hide login/signup, show logout/profile, update nav, etc.
    // ... (implement as needed)
}

function updateUIForLoggedOutUser() {
    // ...
}

// Notification (modernized)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-xl shadow-magic z-50 max-w-sm transform transition-all duration-300 translate-x-full`;
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    notification.className += ` ${colors[type] || colors.info}`;
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icons[type] || icons.info} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// AI Tutor functions
async function handleExplanationRequest(e) {
    e.preventDefault();
    
    const topic = document.getElementById('explanationTopic').value;
    const level = document.getElementById('explanationLevel').value;
    const context = document.getElementById('explanationContext').value;
    
    if (!topic.trim()) {
        showNotification('Please enter a topic to explain', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Generating explanation...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/tutor/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ topic, level, context }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showExplanationResult(data.explanation);
            showNotification('Explanation generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to generate explanation', 'error');
        }
    } catch (error) {
        console.error('Explanation error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleProblemSolve(e) {
    e.preventDefault();
    
    const problem = document.getElementById('problemText').value;
    const showSteps = document.getElementById('showSteps').checked;
    
    if (!problem.trim()) {
        showNotification('Please enter a problem to solve', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Solving problem...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/tutor/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ problem, steps: showSteps }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showProblemSolution(data.solution);
            showNotification('Problem solved successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to solve problem', 'error');
        }
    } catch (error) {
        console.error('Problem solve error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showExplanationResult(explanation) {
    const resultsDiv = document.getElementById('tutorResults');
    const contentDiv = document.getElementById('tutorContent');
    
    if (resultsDiv && contentDiv) {
        contentDiv.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h4 class="font-semibold mb-2">Explanation</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-800">${explanation.explanation}</p>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Key Points</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-700">
                        ${explanation.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Examples</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-700">
                        ${explanation.examples.map(example => `<li>${example}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="level-${explanation.difficulty} font-medium capitalize">${explanation.difficulty} level</span>
                    <span class="text-sm text-gray-500">Estimated time: ${explanation.estimatedTime} minutes</span>
                </div>
            </div>
        `;
        
        resultsDiv.classList.remove('hidden');
    }
}

function showProblemSolution(solution) {
    const resultsDiv = document.getElementById('tutorResults');
    const contentDiv = document.getElementById('tutorContent');
    
    if (resultsDiv && contentDiv) {
        contentDiv.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h4 class="font-semibold mb-2">Solution</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-800">${solution.solution}</p>
                    </div>
                </div>
                
                ${solution.steps ? `
                <div>
                    <h4 class="font-semibold mb-2">Step-by-Step Process</h4>
                    <ol class="list-decimal list-inside space-y-2 text-gray-700">
                        ${solution.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                ` : ''}
                
                <div>
                    <h4 class="font-semibold mb-2">Explanation</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-800">${solution.explanation}</p>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Related Concepts</h4>
                    <div class="flex flex-wrap gap-2">
                        ${solution.relatedConcepts.map(concept => 
                            `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${concept}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        resultsDiv.classList.remove('hidden');
    }
}

// Quiz functions
async function handleQuizGeneration(e) {
    e.preventDefault();
    
    const topic = document.getElementById('quizTopic').value;
    const difficulty = document.getElementById('quizDifficulty').value;
    const focusArea = document.getElementById('quizFocusArea').value;
    const studentLevel = document.getElementById('quizStudentLevel').value;
    
    if (!topic.trim()) {
        showNotification('Please enter a topic for the quiz', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Generating quiz...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/quiz/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ topic, difficulty, focusArea, studentLevel }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentQuiz = data.quiz;
            showQuiz(data.quiz);
            showNotification('Quiz generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to generate quiz', 'error');
        }
    } catch (error) {
        console.error('Quiz generation error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showQuiz(quiz) {
    const quizDisplay = document.getElementById('quizDisplay');
    const quizContent = document.getElementById('quizContent');
    
    if (quizDisplay && quizContent) {
        quizContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-semibold">${quiz.topic} Quiz</h3>
                    <div class="flex items-center space-x-4">
                        <span class="difficulty-${quiz.difficulty} px-3 py-1 rounded-full text-sm font-medium capitalize">${quiz.difficulty}</span>
                        <span class="text-sm text-gray-500">Time limit: ${quiz.timeLimit} minutes</span>
                    </div>
                </div>
                
                <form id="quizAnswerForm" class="space-y-6">
                    ${quiz.questions.map((question, index) => `
                        <div class="border border-gray-200 rounded-lg p-6">
                            <h4 class="font-semibold mb-3">Question ${index + 1}</h4>
                            <p class="text-gray-800 mb-4">${question.question}</p>
                            
                            ${question.type === 'multiple-choice' ? `
                                <div class="space-y-2">
                                    ${question.options.map((option, optIndex) => `
                                        <label class="flex items-center">
                                            <input type="radio" name="q${question.id}" value="${option}" class="mr-2" required>
                                            <span>${option}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            ` : `
                                <input type="text" name="q${question.id}" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="Enter your answer" required>
                            `}
                        </div>
                    `).join('')}
                    
                    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all">
                        <i class="fas fa-check mr-2"></i>Submit Quiz
                    </button>
                </form>
            </div>
        `;
        
        // Add event listener for quiz submission
        const quizAnswerForm = document.getElementById('quizAnswerForm');
        if (quizAnswerForm) {
            quizAnswerForm.addEventListener('submit', handleQuizSubmission);
        }
        
        quizDisplay.classList.remove('hidden');
    }
}

async function handleQuizSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const answers = {};
    
    for (let [key, value] of formData.entries()) {
        answers[parseInt(key.substring(1))] = value;
    }
    
    try {
        const response = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ quizId: currentQuiz.id, answers }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showQuizResults(data.results);
            showNotification('Quiz submitted successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to submit quiz', 'error');
        }
    } catch (error) {
        console.error('Quiz submission error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function showQuizResults(results) {
    const quizResults = document.getElementById('quizResults');
    
    if (quizResults) {
        quizResults.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <h4 class="text-lg font-semibold mb-4">Quiz Results</h4>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div class="text-center">
                        <p class="text-2xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}">${results.score}%</p>
                        <p class="text-sm text-gray-600">Score</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold">${results.correctAnswers}/${results.totalQuestions}</p>
                        <p class="text-sm text-gray-600">Correct Answers</p>
                    </div>
                </div>
                <div class="text-center">
                    <span class="px-4 py-2 rounded-full text-sm font-medium ${results.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${results.passed ? 'Passed!' : 'Failed'}
                    </span>
                </div>
            </div>
        `;
        
        quizResults.classList.remove('hidden');
    }
}

// Study Materials functions
async function handleMaterialUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('materialFile');
    const subject = document.getElementById('materialSubject').value;
    const topic = document.getElementById('materialTopic').value;
    const grade = document.getElementById('materialGrade').value;
    
    if (!fileInput.files[0]) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    if (!subject || !topic) {
        showNotification('Please fill in subject and topic', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('subject', subject);
    formData.append('topic', topic);
    formData.append('grade', grade);
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Uploading...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/materials/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Material uploaded successfully!', 'success');
            e.target.reset();
            loadMaterials();
        } else {
            showNotification(data.error || 'Failed to upload material', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function loadMaterials() {
    if (!currentUser) return;
    
    try {
        const subject = document.getElementById('filterSubject')?.value || '';
        const grade = document.getElementById('filterGrade')?.value || '';
        
        let url = '/api/materials';
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (grade) params.append('grade', grade);
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateMaterialsList(data.materials);
        }
    } catch (error) {
        console.error('Load materials error:', error);
        showNotification('Failed to load materials', 'error');
    }
}

function updateMaterialsList(materials) {
    const content = document.getElementById('materialsContent');
    
    if (content) {
        if (materials.length === 0) {
            content.innerHTML = '<p class="text-gray-500 text-center">No materials found.</p>';
            return;
        }
        
        content.innerHTML = materials.map(material => `
            <div class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${material.originalName}</h4>
                        <p class="text-sm text-gray-600">Subject: ${material.subject} | Topic: ${material.topic}</p>
                        <p class="text-sm text-gray-500">Grade: ${material.grade} | Uploaded: ${new Date(material.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <a href="/uploads/study-materials/${material.filename}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        <i class="fas fa-download mr-1"></i>Download
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Progress functions
async function loadProgressData() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/progress/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateProgress(data);
        }
    } catch (error) {
        console.error('Progress loading error:', error);
        showNotification('Failed to load progress data', 'error');
    }
}

function updateProgress(data) {
    // Update overview cards
    document.getElementById('totalQuizzes').textContent = data.progress.totalQuizzes;
    document.getElementById('averageScore').textContent = `${Math.round(data.progress.averageScore)}%`;
    document.getElementById('passedQuizzes').textContent = data.progress.passedQuizzes;
    document.getElementById('studyTime').textContent = '2.5h'; // Mock data
    
    // Update progress chart
    updateProgressChart(data.detailedProgress);
    
    // Update recent activity
    updateRecentActivity(data.progress.recentActivity);
}

function updateProgressChart(progressData) {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    if (charts.progress) {
        charts.progress.destroy();
    }
    
    const labels = progressData.map(p => new Date(p.completedAt).toLocaleDateString());
    const scores = progressData.map(p => p.score);
    
    charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quiz Scores',
                data: scores,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateRecentActivity(activity) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    if (activity.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No recent activity.</p>';
        return;
    }
    
    container.innerHTML = activity.map(a => `
        <div class="border-b border-gray-200 py-4 last:border-b-0">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-2">
                    <span class="font-medium">Quiz ${a.quizId}</span>
                    <span class="px-2 py-1 rounded text-xs ${a.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${a.passed ? 'Passed' : 'Failed'}
                    </span>
                </div>
                <span class="text-sm text-gray-500">${new Date(a.completedAt).toLocaleDateString()}</span>
            </div>
            <p class="text-gray-800">Score: ${a.score}%</p>
        </div>
    `).join('');
}

// Parent Updates functions
async function handleParentUpdate(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    
    if (!studentId) {
        showNotification('Please enter a student ID', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Generating update...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/parent/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ studentId }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Parent update generated successfully!', 'success');
            loadParentUpdates();
        } else {
            showNotification(data.error || 'Failed to generate parent update', 'error');
        }
    } catch (error) {
        console.error('Parent update error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function loadParentUpdates() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/parent/updates/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateParentUpdatesList(data.updates);
        }
    } catch (error) {
        console.error('Load parent updates error:', error);
        showNotification('Failed to load parent updates', 'error');
    }
}

function updateParentUpdatesList(updates) {
    const content = document.getElementById('updatesContent');
    
    if (content) {
        if (updates.length === 0) {
            content.innerHTML = '<p class="text-gray-500 text-center">No parent updates available.</p>';
            return;
        }
        
        content.innerHTML = updates.map(update => `
            <div class="border border-gray-200 rounded-lg p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <h4 class="font-semibold">Progress Update</h4>
                    <span class="text-sm text-gray-500">${new Date(update.timestamp).toLocaleDateString()}</span>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <h5 class="font-medium mb-2">Summary</h5>
                        <p class="text-gray-700">${update.summary}</p>
                    </div>
                    
                    <div>
                        <h5 class="font-medium mb-2">Achievements</h5>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            ${update.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h5 class="font-medium mb-2">Areas for Improvement</h5>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            ${update.areasForImprovement.map(area => `<li>${area}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h5 class="font-medium mb-2">Recommendations</h5>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            ${update.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <h5 class="font-medium mb-1">Next Steps</h5>
                        <p class="text-gray-700">${update.nextSteps}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Voice Assistant Functions
function initializeVoiceAssistant() {
    console.log('🎤 Initializing voice assistant...');
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        updateVoiceStatus('Speech recognition not supported', 'error');
        return;
    }
    
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
        updateVoiceStatus('Speech synthesis not supported', 'error');
        return;
    }
    
    // Initialize speech recognition
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Initialize speech synthesis
    synthesis = window.speechSynthesis;
    
    // Set up recognition event listeners
    recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        isListening = true;
        updateVoiceStatus('Listening...', 'listening');
    };
    
    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        const recognizedTextElement = document.getElementById('recognizedText');
        if (recognizedTextElement) {
            recognizedTextElement.innerHTML = `
                <p class="text-gray-800">${finalTranscript}</p>
                ${interimTranscript ? `<p class="text-gray-500 italic">${interimTranscript}</p>` : ''}
            `;
        }
        
        // Auto-process if enabled
        if (finalTranscript && document.getElementById('autoProcessCommands')?.checked) {
            processVoiceCommand(finalTranscript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        updateVoiceStatus(`Error: ${event.error}`, 'error');
        stopVoiceRecognition();
    };
    
    recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        isListening = false;
        updateVoiceStatus('Ready', 'ready');
        stopVoiceRecognition();
    };
    
    // Initialize WebSocket connection
    initializeVoiceWebSocket();
    
    // Load voice assistant status
    loadVoiceStatus();
    
    // Set up voice assistant event listeners
    setupVoiceEventListeners();
    
    console.log('✅ Voice assistant initialized');
}

function initializeVoiceWebSocket() {
    try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        voiceWebSocket = new WebSocket(wsUrl);
        
        voiceWebSocket.onopen = () => {
            console.log('🔊 Voice WebSocket connected');
            updateVoiceStatus('Connected', 'connected');
        };
        
        voiceWebSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleVoiceWebSocketMessage(data);
        };
        
        voiceWebSocket.onerror = (error) => {
            console.error('Voice WebSocket error:', error);
            updateVoiceStatus('WebSocket error', 'error');
        };
        
        voiceWebSocket.onclose = () => {
            console.log('Voice WebSocket disconnected');
            updateVoiceStatus('Disconnected', 'disconnected');
        };
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        updateVoiceStatus('WebSocket failed', 'error');
    }
}

function handleVoiceWebSocketMessage(data) {
    switch (data.type) {
        case 'voice_response':
            handleVoiceResponse(data.data);
            break;
        case 'recognition_result':
            handleRecognitionResult(data.data);
            break;
        case 'voice_quiz':
            handleVoiceQuiz(data.data);
            break;
        case 'error':
            showNotification(data.error, 'error');
            break;
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

function setupVoiceEventListeners() {
    // Voice recognition controls
    const startBtn = document.getElementById('startVoiceRecognition');
    const stopBtn = document.getElementById('stopVoiceRecognition');
    const processBtn = document.getElementById('processVoiceCommand');
    
    if (startBtn) {
        startBtn.addEventListener('click', startVoiceRecognition);
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', stopVoiceRecognition);
    }
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            const text = document.getElementById('recognizedText')?.textContent?.trim();
            if (text) {
                processVoiceCommand(text);
            }
        });
    }
    
    // Text-to-speech controls
    const speakBtn = document.getElementById('speakText');
    const stopSpeakBtn = document.getElementById('stopSpeaking');
    const textToSpeak = document.getElementById('textToSpeak');
    
    if (speakBtn) {
        speakBtn.addEventListener('click', speakText);
    }
    if (stopSpeakBtn) {
        stopSpeakBtn.addEventListener('click', stopSpeaking);
    }
    
    // Voice speed and pitch controls
    const speedSlider = document.getElementById('voiceSpeed');
    const pitchSlider = document.getElementById('voicePitch');
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = `${e.target.value}x`;
        });
    }
    if (pitchSlider) {
        pitchSlider.addEventListener('input', (e) => {
            document.getElementById('pitchValue').textContent = `${e.target.value}x`;
        });
    }
    
    // Voice quiz controls
    const generateQuizBtn = document.getElementById('generateVoiceQuiz');
    const startQuizBtn = document.getElementById('startVoiceQuiz');
    const stopQuizBtn = document.getElementById('stopVoiceQuiz');
    
    if (generateQuizBtn) {
        generateQuizBtn.addEventListener('click', generateVoiceQuiz);
    }
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startVoiceQuiz);
    }
    if (stopQuizBtn) {
        stopQuizBtn.addEventListener('click', stopVoiceQuiz);
    }
    
    // Voice settings
    const saveSettingsBtn = document.getElementById('saveVoiceSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveVoiceSettings);
    }
}

function startVoiceRecognition() {
    if (!recognition) {
        showNotification('Speech recognition not available', 'error');
        return;
    }
    
    try {
        recognition.start();
        document.getElementById('startVoiceRecognition').classList.add('hidden');
        document.getElementById('stopVoiceRecognition').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to start recognition:', error);
        showNotification('Failed to start voice recognition', 'error');
    }
}

function stopVoiceRecognition() {
    if (recognition && isListening) {
        recognition.stop();
    }
    
    document.getElementById('startVoiceRecognition').classList.remove('hidden');
    document.getElementById('stopVoiceRecognition').classList.add('hidden');
}

async function processVoiceCommand(command) {
    if (!command.trim()) {
        showNotification('No command to process', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/voice/command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                command: command,
                context: {
                    userLevel: currentUser?.grade || 'high-school',
                    subject: currentUser?.subject || 'general'
                }
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayVoiceResponse(data.result);
            
            // Auto-speak response if enabled
            if (document.getElementById('autoProcessCommands')?.checked) {
                speakText(data.result.response);
            }
        } else {
            showNotification(data.error || 'Failed to process voice command', 'error');
        }
    } catch (error) {
        console.error('Voice command error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function displayVoiceResponse(result) {
    const aiResponseElement = document.getElementById('aiResponse');
    if (aiResponseElement) {
        aiResponseElement.innerHTML = `
            <div class="space-y-3">
                <div>
                    <strong>Command:</strong> ${result.command}
                </div>
                <div>
                    <strong>Response:</strong> ${result.response}
                </div>
                <div class="text-sm text-gray-600">
                    <strong>Context:</strong> ${result.context.userLevel} level, ${result.context.subject} subject
                </div>
            </div>
        `;
    }
}

async function speakText(text = null) {
    const textToSpeak = text || document.getElementById('textToSpeak')?.value;
    
    if (!textToSpeak) {
        showNotification('No text to speak', 'warning');
        return;
    }
    
    try {
        const speed = document.getElementById('voiceSpeed')?.value || 1;
        const pitch = document.getElementById('voicePitch')?.value || 1;
        const persona = document.getElementById('voicePersona')?.value || 'educational';
        
        const response = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                text: textToSpeak,
                options: {
                    speed: parseFloat(speed),
                    pitch: parseFloat(pitch),
                    voice: persona
                }
            })
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                audioPlayer.src = audioUrl;
                audioPlayer.classList.remove('hidden');
                audioPlayer.play();
                isSpeaking = true;
            }
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to synthesize speech', 'error');
        }
    } catch (error) {
        console.error('Speech synthesis error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function stopSpeaking() {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        isSpeaking = false;
    }
}

async function generateVoiceQuiz() {
    const topic = document.getElementById('voiceQuizTopic')?.value;
    const difficulty = document.getElementById('voiceQuizDifficulty')?.value;
    const count = document.getElementById('voiceQuizCount')?.value;
    
    if (!topic) {
        showNotification('Please enter a quiz topic', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/voice/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                topic: topic,
                difficulty: difficulty,
                count: parseInt(count)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            voiceQuizData = data.result;
            displayVoiceQuiz(voiceQuizData);
            showNotification('Voice quiz generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to generate voice quiz', 'error');
        }
    } catch (error) {
        console.error('Voice quiz error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function displayVoiceQuiz(quizData) {
    const quizContent = document.getElementById('voiceQuizContent');
    const quizQuestions = document.getElementById('voiceQuizQuestions');
    
    if (quizContent && quizQuestions) {
        quizContent.classList.remove('hidden');
        
        quizQuestions.innerHTML = quizData.questions.map((question, index) => `
            <div class="border border-gray-200 rounded-lg p-4">
                <h5 class="font-semibold mb-2">Question ${index + 1}</h5>
                <p class="text-gray-700 mb-2">${question.question}</p>
                <p class="text-sm text-gray-600"><strong>Answer:</strong> ${question.answer}</p>
            </div>
        `).join('');
    }
}

function startVoiceQuiz() {
    if (!voiceQuizData || !voiceQuizData.questions.length) {
        showNotification('No quiz available. Please generate a quiz first.', 'warning');
        return;
    }
    
    currentVoiceQuestion = 0;
    speakVoiceQuestion();
    
    document.getElementById('startVoiceQuiz').classList.add('hidden');
    document.getElementById('stopVoiceQuiz').classList.remove('hidden');
}

function speakVoiceQuestion() {
    if (currentVoiceQuestion >= voiceQuizData.questions.length) {
        stopVoiceQuiz();
        return;
    }
    
    const question = voiceQuizData.questions[currentVoiceQuestion];
    const questionText = `Question ${currentVoiceQuestion + 1}: ${question.question}`;
    
    speakText(questionText);
    
    // Set up recognition for answer
    setTimeout(() => {
        if (isListening) {
            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    processVoiceQuizAnswer(finalTranscript);
                }
            };
        }
    }, 2000);
}

function processVoiceQuizAnswer(answer) {
    const question = voiceQuizData.questions[currentVoiceQuestion];
    const isCorrect = answer.toLowerCase().includes(question.answer.toLowerCase());
    
    const feedback = isCorrect ? 
        `Correct! The answer is ${question.answer}` : 
        `Incorrect. The correct answer is ${question.answer}`;
    
    speakText(feedback);
    
    currentVoiceQuestion++;
    
    setTimeout(() => {
        if (currentVoiceQuestion < voiceQuizData.questions.length) {
            speakVoiceQuestion();
        } else {
            speakText('Quiz completed! Great job!');
            stopVoiceQuiz();
        }
    }, 3000);
}

function stopVoiceQuiz() {
    currentVoiceQuestion = 0;
    document.getElementById('startVoiceQuiz').classList.remove('hidden');
    document.getElementById('stopVoiceQuiz').classList.add('hidden');
    stopSpeaking();
}

async function loadVoiceStatus() {
    try {
        const response = await fetch('/api/voice/status');
        const data = await response.json();
        
        if (response.ok) {
            updateVoiceStatusUI(data.status);
        }
    } catch (error) {
        console.error('Failed to load voice status:', error);
        updateVoiceStatus('Status unavailable', 'error');
    }
}

function updateVoiceStatusUI(status) {
    const statusText = document.getElementById('voiceStatus');
    const indicator = document.getElementById('voiceIndicator');
    const statusTextElement = document.getElementById('voiceStatusText');
    
    if (statusText) {
        statusText.textContent = `Voice Assistant: ${status.enabled ? 'Enabled' : 'Disabled'}`;
    }
    
    if (indicator) {
        indicator.className = `w-4 h-4 rounded-full ${status.enabled ? 'bg-green-500' : 'bg-red-500'}`;
    }
    
    if (statusTextElement) {
        statusTextElement.textContent = status.enabled ? 'Ready' : 'Disabled';
        statusTextElement.className = `text-sm font-medium ${status.enabled ? 'text-green-600' : 'text-red-600'}`;
    }
}

function updateVoiceStatus(message, type = 'info') {
    const statusText = document.getElementById('voiceStatus');
    const indicator = document.getElementById('voiceIndicator');
    const statusTextElement = document.getElementById('voiceStatusText');
    
    if (statusText) {
        statusText.textContent = message;
    }
    
    if (indicator) {
        const colors = {
            ready: 'bg-green-500',
            listening: 'bg-blue-500',
            speaking: 'bg-purple-500',
            error: 'bg-red-500',
            connected: 'bg-green-500',
            disconnected: 'bg-gray-500'
        };
        indicator.className = `w-4 h-4 rounded-full ${colors[type] || 'bg-gray-500'}`;
    }
    
    if (statusTextElement) {
        statusTextElement.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        statusTextElement.className = `text-sm font-medium text-${type === 'error' ? 'red' : type === 'ready' ? 'green' : 'gray'}-600`;
    }
}

function saveVoiceSettings() {
    const settings = {
        recognitionLanguage: document.getElementById('recognitionLanguage')?.value || 'en-US',
        speechLanguage: document.getElementById('speechLanguage')?.value || 'en-US',
        voicePersona: document.getElementById('voicePersona')?.value || 'educational',
        continuousRecognition: document.getElementById('continuousRecognition')?.checked || false,
        interimResults: document.getElementById('interimResults')?.checked || true,
        autoProcessCommands: document.getElementById('autoProcessCommands')?.checked || false
    };
    
    // Update recognition settings
    if (recognition) {
        recognition.lang = settings.recognitionLanguage;
        recognition.continuous = settings.continuousRecognition;
        recognition.interimResults = settings.interimResults;
    }
    
    // Save to localStorage
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
    
    showNotification('Voice settings saved successfully!', 'success');
}

// Load voice settings on initialization
function loadVoiceSettings() {
    const savedSettings = localStorage.getItem('voiceSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        if (document.getElementById('recognitionLanguage')) {
            document.getElementById('recognitionLanguage').value = settings.recognitionLanguage;
        }
        if (document.getElementById('speechLanguage')) {
            document.getElementById('speechLanguage').value = settings.speechLanguage;
        }
        if (document.getElementById('voicePersona')) {
            document.getElementById('voicePersona').value = settings.voicePersona;
        }
        if (document.getElementById('continuousRecognition')) {
            document.getElementById('continuousRecognition').checked = settings.continuousRecognition;
        }
        if (document.getElementById('interimResults')) {
            document.getElementById('interimResults').checked = settings.interimResults;
        }
        if (document.getElementById('autoProcessCommands')) {
            document.getElementById('autoProcessCommands').checked = settings.autoProcessCommands;
        }
    }
}

// Call loadVoiceSettings when voice section is shown
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    
    if (sectionId === 'voice') {
        loadVoiceSettings();
        loadVoiceStatus();
    }
}; 