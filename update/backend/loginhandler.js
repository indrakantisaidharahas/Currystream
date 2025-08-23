const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You must replace this with your service account key file
const serviceAccount = require('.serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// CORS headers for client-side requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// A protected route that verifies the ID token
app.get('/verify-token', async (req, res) => {
    // Get the ID token from the Authorization header
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).send('Unauthorized: No token provided.');
    }

    try {
        // Verify the ID token using the Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Token verified successfully for user:', decodedToken.uid);
        
        // The user is authenticated. You can now perform your backend logic.
        res.status(200).json({ message: 'Token is valid.', uid: decodedToken.uid });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }
});

// This is an example of a sign-up route, but it's more common to handle this on the client
// just like the login route above.
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await admin.auth().createUser({ email, password });
        res.status(200).json({ uid: userRecord.uid, message: 'User created successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});