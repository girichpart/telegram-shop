import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const env = import.meta.env;

const themeVars = {
  '--primary': env.VITE_PNS_PRIMARY || env.VITE_THEME_TEXT || '#0f0f0f',
  '--secondary': env.VITE_PNS_SECONDARY || env.VITE_THEME_BG || '#f6f6f2',
  '--primary-foreground': env.VITE_PNS_PRIMARY_FOREGROUND || '#ffffff',
  '--secondary-foreground': env.VITE_PNS_SECONDARY_FOREGROUND || '#1a1a1a',
  '--header-height': env.VITE_PNS_HEADER_HEIGHT || '64px',
  '--notification-height': env.VITE_PNS_NOTIFICATION_HEIGHT || '0px'
};

Object.entries(themeVars).forEach(([key, value]) => {
  if (value) {
    document.documentElement.style.setProperty(key, value);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
