import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // Create this file for styling

const NavBar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">My App</Link>
            <div className="nav-links">
                <Link to="/streamer">Streamer</Link>
                <Link to="/player">HLS Player</Link>
                <Link to="/login">Login</Link>
            </div>
        </nav>
    );
};

export default NavBar;