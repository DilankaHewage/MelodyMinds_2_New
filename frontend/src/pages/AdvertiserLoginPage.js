import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdvertiserLoginPage.css';

const AdvertiserLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill out both fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/advertisers/login', {
        email,
        password,
      });

      console.log('Login successful:', response.data);

      localStorage.setItem('token', response.data.token);

      setError('');
      navigate('/advertiser-dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="advertiser-login-container">
      <div className="login-box">
        <h2 className="login-heading">Login to Your Account</h2>
        <form onSubmit={handleLogin} className="form-group">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/create-advertiser-account">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default AdvertiserLoginPage; 
