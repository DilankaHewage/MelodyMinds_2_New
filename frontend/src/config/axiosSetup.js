// frontend/src/config/axiosSetup.js
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Any request pointing to localhost:5000 → rewrite to the current API_BASE_URL
axios.interceptors.request.use((config) => {
  const url = config.url || '';
  const LOCAL_BASE = 'http://localhost:5000';

  // If a full absolute URL starts with localhost:5000, swap the origin
  if (url.startsWith(LOCAL_BASE)) {
    const path = url.substring(LOCAL_BASE.length); // keep "/api/..."
    config.url = `${API_BASE_URL}${path}`;
    return config;
  }

  // If the URL is already relative like "/api/...", prepend API_BASE_URL
  if (url.startsWith('/')) {
    config.url = `${API_BASE_URL}${url}`;
    return config;
  }

  return config;
});