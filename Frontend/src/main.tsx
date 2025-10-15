import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './styles/leaflet-zindex.css';
import './i18n/config'; // Initialize i18n
import { setupAxiosInterceptors } from './utils/axios'; // Setup axios interceptors

// Setup axios interceptors for Accept-Language header
setupAxiosInterceptors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

