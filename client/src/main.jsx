import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const themeVars = {
  '--tma-bg': import.meta.env.VITE_THEME_BG,
  '--tma-text': import.meta.env.VITE_THEME_TEXT,
  '--tma-muted': import.meta.env.VITE_THEME_MUTED,
  '--tma-link': import.meta.env.VITE_THEME_LINK,
  '--tma-button': import.meta.env.VITE_THEME_BUTTON,
  '--tma-accent': import.meta.env.VITE_THEME_ACCENT,
  '--tma-card': import.meta.env.VITE_THEME_CARD,
  '--tma-border': import.meta.env.VITE_THEME_BORDER
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
