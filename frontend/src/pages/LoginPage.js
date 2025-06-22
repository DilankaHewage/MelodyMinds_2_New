import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API requests
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Using useNavigate for redirection

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setError('');

    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      // Handle successful login (Store JWT in localStorage or context)
      const { token, userId, userName } = response.data;
      localStorage.setItem('userToken', token); // Store token in localStorage for future requests
      localStorage.setItem('userId', userId); // Store user ID for comment ownership checks
      localStorage.setItem('userName', userName); // Store user name for display

      console.log('Login successful:', response.data);
      navigate('/userdashboard'); // Redirect user to User Dashboard after login
    } catch (error) {
      // Handle errors (e.g., invalid credentials)
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data.message); // Display the error message
      } else {
        setError('An error occurred during login.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>User Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>} {/* Show error message if there's an error */}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <div className="signup-link">
            <span>Don't have an account? </span>
            <Link to="/create-user-account" className="link-button">
              Create one here
            </Link>
          </div>
          <div className="advertiser-login-link">
            <span>Are you an advertiser? </span>
            <Link to="/advertiser-login" className="link-button">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;