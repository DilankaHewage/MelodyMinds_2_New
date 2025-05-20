import React from 'react';
import ReactDOM from 'react-dom/client';  // Change to 'react-dom/client' for React 18
import './index.css';
import App from './App';

// Get the root element
const rootElement = document.getElementById('root');

// Create root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
