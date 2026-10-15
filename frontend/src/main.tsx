import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register Service Worker for offline PWA shell and API caching
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost.disabled')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[HelpDesk 360] Service Worker active, scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[HelpDesk 360] Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
