import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './NavBar';
import LoginPage from './LoginPage';
import Streamer from './Streamer';
import HLSPlayer from './HLSPlayer';

function Home() {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Welcome to the Streaming App!</h1>
            <p>Please use the navigation bar to get started.</p>
        </div>
    );
}

function App() {
  // Define the HLS stream URL here, matching your Node Media Server's configuration
  const streamUrl = 'http://localhost:8000/live/stream/index.m3u8';
  
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/streamer" element={<Streamer />} />
        <Route path="/player" element={<HLSPlayer streamUrl={streamUrl} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;