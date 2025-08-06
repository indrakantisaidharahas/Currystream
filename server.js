// server.js

// --- ESM Imports ---
import express from 'express';
// For multer, you might need to import it differently if it's a default export
// If './middlewares/multer.js' exports a default, use:
import upload from './middlewares/multer.js';
// If it exports a named export called 'upload', use:
// import { upload } from './middlewares/multer.js';
// Check your multer.js file how it exports! I'll assume default for now.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid'; // v4 is a named export from uuid

// --- ESM way to get __dirname (for file paths) ---
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ----------------------------------------------------

const PORT = 3000;

const app = express();

// CORS configuration - Restrict to your frontend's origin in production!
const corsOptions = {
  origin: 'http://localhost:5173', // Change this to your Vite frontend's development URL
  // In production, change this to: 'https://your-streamapp-frontend.com'
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// --- IN-MEMORY STORAGE (NOT PERSISTENT! REPLACE WITH A DATABASE!) ---
const chapters = {};
// ------------------------------------------------------------------

app.post('/upload', upload.single('video'), (req, res) => {
  // Check if a file was actually uploaded by multer
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  const chapterId = uuidv4();
  const videoPath = req.file.path; // Path where multer saved the uploaded video
  const outputDir = path.join(__dirname, 'public', 'videos', chapterId); // Use path.join for OS-agnostic paths
  const outputFileName = 'output.m3u8';
  const outputPath = path.join(outputDir, outputFileName);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory ${outputDir}: ${err}`);
      return res.status(500).json({ error: 'Failed to create output directory.' });
    }
  }

  // FFmpeg command for single-quality HLS output
  const ffmpegArgs = [
    '-i', videoPath,
    '-map', '0:v:0',
    '-c:v', 'libx264',
    '-crf', '23',
    '-preset', 'medium',
    '-g', '48',
    '-map', '0:a:0',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-hls_time', '10',
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments',
    '-f', 'hls',
    outputPath
  ];

  console.log(`Starting FFmpeg conversion for chapter ${chapterId}...`);
  console.log(`Command: ffmpeg ${ffmpegArgs.join(' ')}`);

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error(`ffmpeg stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg process exited with code ${code}`);
      return res.status(500).json({ error: 'Failed to convert video to HLS format.' });
    }
    console.log(`FFmpeg conversion for chapter ${chapterId} completed successfully.`);

    const videoUrl = `/public/videos/${chapterId}/${outputFileName}`;
    chapters[chapterId] = { videoUrl, title: req.body.title || `Chapter ${chapterId}` };
    res.json({ success: true, message: 'Video uploaded and converted to HLS.', chapterId });

    fs.unlink(videoPath, (err) => {
      if (err) console.error(`Error deleting original video file ${videoPath}: ${err}`);
      else console.log(`Original video file ${videoPath} deleted.`);
    });
  });

  ffmpeg.on('error', (err) => {
    console.error(`Failed to start ffmpeg process: ${err}`);
    res.status(500).json({ error: 'Failed to start video conversion process.' });
  });
});

app.get('/getVideo', (req, res) => {
  const { chapterId } = req.query;
  if (!chapterId || !chapters[chapterId]) {
    return res.status(404).json({ error: 'Chapter not found' });
  }
  const { title, videoUrl } = chapters[chapterId];
  console.log(`Serving chapter: ${title}, URL: ${videoUrl}`);
  res.json({ title: title, url: videoUrl });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
