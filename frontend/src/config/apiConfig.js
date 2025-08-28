// Manual switch - change this when you want to deploy
const USE_PRODUCTION = false; // Set to true when deploying

const API_CONFIG = {
  local: 'http://localhost:5000',
  production: 'https://melodyminds2new-production.up.railway.app'
};

export const API_BASE_URL = USE_PRODUCTION ? API_CONFIG.production : API_CONFIG.local;

export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
