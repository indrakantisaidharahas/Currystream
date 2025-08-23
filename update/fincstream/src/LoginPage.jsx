import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Set persistence to "session" or "local" (default)
    useEffect(() => {
        setPersistence(auth, browserSessionPersistence)
            .then(() => {
                console.log("Persistence set to session.");
            })
            .catch((error) => {
                console.error("Error setting persistence:", error);
            });
    }, []);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user);
            alert('Login successful! Redirecting...');
            
            navigate('/Home');
        } catch (error) {
            console.error('Login failed:', error);
            alert(error.message);
        }
    };

    const handleSignup = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Signup successful:', userCredential.user);
            alert('Sign up successful! You can now log in.');
            
        } catch (error) {
            console.error('Signup failed:', error);
            alert(error.message);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <h2>Login / Sign Up</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <button type="button" onClick={handleLogin}>Log In</button>
                <button type="button" onClick={handleSignup}>Sign Up</button>
            </form>
        </div>
    );
}

export default LoginPage;