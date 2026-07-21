import axios from 'axios';

// Em ambiente dev local, o servidor Express corre na porta 5000.
// Na Vercel, o frontend e backend partilham o mesmo domínio, logo usamos apenas '/api'
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  console.log(`[API-REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  return config;
}, (error) => {
  console.error('[API-REQUEST-ERROR]', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API-RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API-RESPONSE-ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response && error.response.status === 403 && error.response.data?.code === 'SUBSCRIPTION_EXPIRED') {
      // Redirecionar para a página de assinatura
      window.location.href = '/app/assinatura';
    }
    
    return Promise.reject(error);
  }
);

export default api;
