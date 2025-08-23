// rtmp.js
import NodeMediaServer from 'node-media-server';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Ensure HLS folder exists
const hlsFolder = path.resolve('./hls_output');
if (!fs.existsSync(hlsFolder)) {
  fs.mkdirSync(hlsFolder, { recursive: true });
  console.log('Created HLS output folder at', hlsFolder);
}

const config = {
  rtmp: {
    port: parseInt(process.env.RTMP_PORT) || 1936,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
  port: parseInt(process.env.HTTP_PORT) || 8000,
  allow_origin: '*',
  mediaroot: hlsFolder,      // where HLS files are written
  webroot: './',             // root for HTTP serving
},

  trans: {
    ffmpeg: '/usr/bin/ffmpeg', // adjust if your ffmpeg path is different
    tasks: [
      {
        app: 'live',
        ac: 'aac',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
      },
    ],
  },
};

const nms = new NodeMediaServer(config);
nms.run();

console.log('NodeMediaServer running:');
console.log(`- RTMP: rtmp://localhost:${config.rtmp.port}/live/stream`);
console.log(`- HLS Folder: ${hlsFolder}`);
console.log(`- HLS URL: http://localhost:${config.http.port}/live/stream.m3u8`);

// Optional: log RTMP events
nms.on('postPublish', (id, StreamPath, args) => {
  console.log(`[RTMP] Stream started: ${StreamPath} (id=${id})`);
});
nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`[RTMP] Stream ended: ${StreamPath} (id=${id})`);
});
