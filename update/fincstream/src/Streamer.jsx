import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Streamer = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('Not streaming');
  const [currentUser, setCurrentUser] = useState(null);

  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();

  // useEffect hook to handle authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const startStreaming = async () => {
    try {
      if (!currentUser) {
        setStatus('Error: No authenticated user.');
        console.error('Error: No authenticated user.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      webcamRef.current.srcObject = stream;

      const idToken = await currentUser.getIdToken();

      const ws = new WebSocket('ws://localhost:8081', idToken);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('Streaming...');
        setIsStreaming(true);
        console.log('WebSocket connection established.');
      };

      ws.onclose = () => {
        setStatus('Disconnected.');
        setIsStreaming(false);
        console.log('WebSocket connection closed.');
      };

      ws.onerror = (error) => {
        setStatus('Error occurred.');
        console.error('WebSocket error:', error);
      };

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(100);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setStatus(`Error - ${error.message}`);
    }
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    if (webcamRef.current.srcObject) {
      webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setStatus('Stopped.');
    setIsStreaming(false);
  };

  return (
    <div className="webcam-container">
      <h1>Webcam to Server Stream</h1>
      <video id="webcam" ref={webcamRef} autoPlay muted></video>
      <div className="controls">
        <button onClick={startStreaming} disabled={isStreaming}>Start Streaming</button>
        <button onClick={stopStreaming} disabled={!isStreaming}>Stop Streaming</button>
      </div>
      <p>Status: {status}</p>
    </div>
  );
};

export default Streamer;