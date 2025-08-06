// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// IMPORTANT: Be explicit with file extensions here, especially when mixing .tsx with .js/.jsx
// If your App component is also .js or .jsx, specify that too.
import App from './App.jsx';      // Assuming App is still .jsx, common in Vite default setup
import Form from './Form.jsx';     // <-- Explicitly .js
import Dashboard from './Dashboard.jsx'; // <-- Explicitly .js

// React Router v6 imports remain the same
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Your global CSS (if any)
import './index.css'; // Adjust path/name as per your project

ReactDOM.createRoot(document.getElementById('root')!).render( // The '!' is a TypeScript non-null assertion
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/App" element={<App />} />
        {/* Add more routes or a 404 handler here */}
      </Routes>
    </Router>
  </React.StrictMode>,
);
