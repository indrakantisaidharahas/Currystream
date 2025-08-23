import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import admin from 'firebase-admin';

const WS_PORT = 8081;
const RTMP_URL = 'rtmp://localhost:1936/live/stream';

let ffmpegProcess = null;

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Authentication function for WebSocket connections
const verifyClient = async (info, done) => {
    // Look for the token in the WebSocket sub-protocols header
    const tokenHeader = info.req.headers['sec-websocket-protocol'];
    const idToken = tokenHeader?.split(',')[0].trim();

    if (!idToken) {
        console.error('🚫 WebSocket auth failed: No token provided.');
        // Reject the connection
        return done(false, 401, 'Unauthorized'); 
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('✅ WebSocket auth successful for user:', decodedToken.uid);
        // If the token is valid, accept the connection
        done(true);
    } catch (error) {
        console.error('🚫 WebSocket auth failed: Invalid token.');
        // Reject the connection
        done(false, 403, 'Forbidden');
    }
};

// Start the WebSocket server with the authentication check
const wss = new WebSocketServer({ 
    port: WS_PORT,
    verifyClient: verifyClient,
});

wss.on('connection', ws => {
    console.log('🔗 Client connected to WebSocket');

    // Create a new FFmpeg process for each connection
    ffmpegProcess = spawn('ffmpeg', [
        '-i', '-',         // Input from stdin
        '-c:v', 'libx264', // Output video codec
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-f', 'flv',       // Output format (Flash Video)
        RTMP_URL,          // RTMP output URL
    ]);

    ffmpegProcess.on('error', (err) => {
        console.error('❌ FFmpeg failed to start:', err);
    });

    ffmpegProcess.stderr.on('data', data => {
        console.log(`FFmpeg: ${data}`);
    });

    ws.on('message', data => {
        if (ffmpegProcess && ffmpegProcess.stdin.writable) {
            ffmpegProcess.stdin.write(data);
        }
    });

    ws.on('close', () => {
        console.log('🔌 Client disconnected.');
        if (ffmpegProcess) {
            ffmpegProcess.kill('SIGINT');
            ffmpegProcess = null;
        }
    });
});

console.log(`📡 WebSocket Server running at ws://localhost:${WS_PORT}`);
console.log(`🎬 FFmpeg streaming to ${RTMP_URL}`);