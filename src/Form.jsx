// src/Form.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
// Import signInUser (and signUpUser if you want that functionality too) as named exports
import { signInUser, signUpUser } from './authication.jsx'; // Correct import path and named import syntax
// Make sure your styles object is defined somewhere, e.g., at the bottom of this file

function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // To toggle between sign-in/sign-up modes
  const navigate = useNavigate();
  // Function to handle form submission (now async)
  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault();
    setMessage('Processing...'); // Show a loading message

    let result;
    if (isSigningUp) {
      result = await signUpUser(email, password);
       // Await the signUpUser call
       navigate('/App')
    } else {
      result = await signInUser(email, password); 
      navigate('/App')// Await the signInUser call (for login button)
    }

    if (result.success) {
      setMessage(`Success! User: ${result.user.email}`);
      // In a real app, you'd navigate the user to a dashboard here
      // For example, using React Router: navigate('/dashboard');
      setEmail(''); // Clear form on success
      setPassword('');
    } else {
      // Display a more user-friendly error message based on Firebase error codes
      let friendlyErrorMessage = 'An unknown error occurred.';
      switch (result.errorCode) {
        case 'auth/user-not-found':
          friendlyErrorMessage = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          friendlyErrorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          friendlyErrorMessage = 'The email address is not valid.';
          break;
        case 'auth/email-already-in-use':
          friendlyErrorMessage = 'This email is already registered. Please sign in instead.';
          break;
        default:
          friendlyErrorMessage = result.error || 'Failed to authenticate.';
      }
      setMessage(`Error: ${friendlyErrorMessage}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Welcome to Streamapp!</h2>
      <p style={styles.subheading}>Please {isSigningUp ? 'sign up' : 'log in'} to continue.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="your@example.com"
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="password"
          />
        </div>

        <button type="submit" style={styles.button}>
          {isSigningUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <button
        style={{ ...styles.button, backgroundColor: '#6c757d', marginTop: '10px' }}
        onClick={() => {
          setIsSigningUp(!isSigningUp);
          setMessage(''); // Clear message when toggling mode
        }}
      >
        {isSigningUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

// Basic inline styles for a clean look (kept from your previous example)
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  heading: {
    color: '#333',
    marginBottom: '10px',
  },
  subheading: {
    color: '#666',
    marginBottom: '25px',
    fontSize: '0.95em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: 'calc(100% - 20px)', // Full width minus padding
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
  },
  button: {
    backgroundColor: '#4285F4', // Google's blue, often associated with Firebase
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.1em',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#357ae8',
  },
  message: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#e0f7fa',
    border: '1px solid #b2ebf2',
    borderRadius: '4px',
    color: '#00796b',
  },
};


export default Form;
