import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

const HLSPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if the browser supports HLS.js
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.warn('Autoplay blocked, user interaction needed', err));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for Safari's native HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.warn('Autoplay blocked, user interaction needed', err));
      });
    } else {
      console.error("Your browser does not support HLS.");
    }

    // Cleanup function to stop the stream if the component unmounts
    return () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamUrl]);

  return (
    <div className="hls-player-container">
      <h1>Live Stream</h1>
      <video ref={videoRef} controls autoPlay muted playsInline style={{ width: '80%' }}></video>
    </div>
  );
};

export default HLSPlayer;