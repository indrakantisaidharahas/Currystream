import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assuming you still have an App component somewhere
import Form from './Form'; // Your login/signup form
import Dashboard from './Dashboard'; // Your dashboard page

// Import the correct components for React Router v6
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode> {/* It's good practice to wrap your app in StrictMode */}
    <Router>
      {/* Replace <Switch> with <Routes> */}
      <Routes>
        {/* Replace 'component={Form}' with 'element={<Form />}'
            'exact' is implicitly handled by <Routes> for the best match */}
        <Route path="/" element={<Form />} />

        {/* Similar change for your Dashboard route */}
        <Route path="/app" element={<App />} />
        
        {/* You can also add a catch-all for 404 pages */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  </React.StrictMode>
);
