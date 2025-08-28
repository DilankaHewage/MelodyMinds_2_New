// frontend/src/config/apiConfig.js

// Use an environment variable so dev and prod work without code changes.
// - Local dev: set REACT_APP_API_URL=http://localhost:5000 in frontend/.env
// - Vercel: set REACT_APP_API_URL=https://melodyminds2new-production.up.railway.app in Project Settings
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;