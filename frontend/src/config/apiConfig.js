// API Configuration for different environments
const API_CONFIG = {
  // Development (local)
  development: 'http://localhost:5000',
  
  // Production (Railway)
  production: 'https://melodyminds2new-production.up.railway.app'
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Export the base URL
export const API_BASE_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
