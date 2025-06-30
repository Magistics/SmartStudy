const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} = require('firebase/auth');

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.adminApp = null;
    this.clientApp = null;
    this.auth = null;
    this.db = null;
  }

  // Initialize Firebase with configuration
  initialize() {
    try {
      // Client-side Firebase config
      const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      };

      // Initialize client-side Firebase
      this.clientApp = initializeApp(firebaseConfig);
      this.auth = getAuth(this.clientApp);

      // Initialize admin SDK for server-side operations
      const serviceAccount = {
        type: process.env.FIREBASE_ADMIN_TYPE,
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
        auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
        token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
      };

      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
      });

      this.db = admin.firestore();
      this.initialized = true;

      console.log('✅ Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
      return false;
    }
  }

  // Email/Password Authentication
  async signUpWithEmail(email, password, userData = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update user profile with additional data
      await updateProfile(user, {
        displayName: userData.displayName || userData.username || email.split('@')[0],
        photoURL: userData.photoURL || null
      });

      // Store additional user data in Firestore
      await this.createUserDocument(user.uid, {
        email: user.email,
        username: userData.username || email.split('@')[0],
        displayName: userData.displayName || userData.username || email.split('@')[0],
        role: userData.role || 'student',
        grade: userData.grade || '',
        subject: userData.subject || '',
        photoURL: userData.photoURL || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: 'email'
      });

      // Get custom token for server-side operations
      const customToken = await this.adminApp.auth().createCustomToken(user.uid);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        token: customToken,
        provider: 'email'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async signInWithEmail(email, password) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update last login time
      await this.updateUserDocument(user.uid, {
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Get custom token for server-side operations
      const customToken = await this.adminApp.auth().createCustomToken(user.uid);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        token: customToken,
        provider: 'email'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Google Authentication
  async signInWithGoogle() {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await this.getUserDocument(user.uid);
      
      if (!userDoc) {
        // Create new user document for Google sign-in
        await this.createUserDocument(user.uid, {
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName,
          role: 'student',
          grade: '',
          subject: '',
          photoURL: user.photoURL,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          provider: 'google',
          emailVerified: user.emailVerified
        });
      } else {
        // Update last login time
        await this.updateUserDocument(user.uid, {
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          photoURL: user.photoURL,
          displayName: user.displayName
        });
      }

      // Get custom token for server-side operations
      const customToken = await this.adminApp.auth().createCustomToken(user.uid);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        token: customToken,
        provider: 'google'
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Password Reset
  async sendPasswordResetEmail(email) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      await sendPasswordResetEmail(this.auth, email);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Server-side token verification
  async verifyToken(token) {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      const decodedToken = await this.adminApp.auth().verifyIdToken(token);
      return {
        success: true,
        user: decodedToken
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Firestore Database Operations
  async createUserDocument(uid, userData) {
    try {
      await this.db.collection('users').doc(uid).set(userData);
      return { success: true };
    } catch (error) {
      console.error('Create user document error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserDocument(uid) {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      console.error('Get user document error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserDocument(uid, updateData) {
    try {
      await this.db.collection('users').doc(uid).update(updateData);
      return { success: true };
    } catch (error) {
      console.error('Update user document error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteUserDocument(uid) {
    try {
      await this.db.collection('users').doc(uid).delete();
      return { success: true };
    } catch (error) {
      console.error('Delete user document error:', error);
      return { success: false, error: error.message };
    }
  }

  // User Management
  async getAllUsers() {
    try {
      const snapshot = await this.db.collection('users').get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      return { success: true, users };
    } catch (error) {
      console.error('Get all users error:', error);
      return { success: false, error: error.message };
    }
  }

  async searchUsers(query) {
    try {
      const snapshot = await this.db.collection('users')
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .get();
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      return { success: true, users };
    } catch (error) {
      console.error('Search users error:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication State Observer
  onAuthStateChanged(callback) {
    if (!this.initialized) {
      console.error('Firebase not initialized');
      return null;
    }

    return onAuthStateChanged(this.auth, callback);
  }

  // Sign Out
  async signOut() {
    try {
      if (!this.initialized) {
        throw new Error('Firebase not initialized');
      }

      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    if (!this.initialized) {
      return null;
    }
    return this.auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Get Firebase configuration for client-side
  getFirebaseConfig() {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };
  }
}

module.exports = FirebaseService; 