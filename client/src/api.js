import axios from 'axios';

const resolveBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const isLocalEnv = envBase && (envBase.includes('localhost') || envBase.includes('127.0.0.1'));
  if (envBase) {
    if (isLocalEnv && !isLocalHost) {
      return window.location.origin;
    }
    return envBase;
  }
  return window.location.origin;
};

const api = axios.create({
  baseURL: resolveBaseUrl()
});

export default api;
