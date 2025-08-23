// server.js (in finalimp/Backend)
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).send('Unauthorized: No token provided.');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ message: 'Forbidden: Invalid token.' });
  }
};

// --- API Endpoints ---
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await admin.auth().createUser({ email, password });
        res.status(200).json({ uid: userRecord.uid, message: 'User created successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/protected-data', authenticateUser, (req, res) => {
  res.status(200).json({
    message: `Hello, user ${req.user.email}! This is protected data.`,
    uid: req.user.uid,
  });
});

// --- Serving the React App (Frontend) ---
// This is the only line needed to serve your React app.
// It serves all static files and handles fallbacks to index.html for client-side routing.
app.use(express.static(path.join(__dirname, '..', 'fincstream', 'dist')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});