import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Importáljuk a libeket, de az inicializálást védetté tesszük
import { initPerformanceMonitoring } from '@/lib/performance-monitor';
import { initSentry } from '@/lib/sentry';
import { initCloudflareBeacon } from '@/lib/cloudflare';

// Segédfüggvény a biztonságos inicializáláshoz
const initExternalServices = () => {
  // Csak éles környezetben (PROD) fussanak le a trackerek
  // Ha Create React App-ot használsz, akkor: process.env.NODE_ENV === 'production'
  // Ha Vite-ot használsz: import.meta.env.PROD
  const isProduction = import.meta.env ? import.meta.env.PROD : process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('Development mode: Monitoring services skipped.');
    return;
  }

  try {
    initSentry();
  } catch (err) {
    console.error('Failed to init Sentry:', err);
  }

  try {
    initCloudflareBeacon();
  } catch (err) {
    console.error('Failed to init Cloudflare:', err);
  }

  try {
    initPerformanceMonitoring();
  } catch (err) {
    console.error('Failed to init Performance Monitoring:', err);
  }
};

// Szolgáltatások indítása
initExternalServices();

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Kritikus hiba kezelése: Ha nincs hova renderelni, tájékoztatjuk a usert/fejlesztőt
  const msg = 'Fatal Error: Root element not found. Application cannot start.';
  console.error(msg);
  
  // Opcionális: Vizuális visszajelzés a body-ba, hogy ne csak fehér képernyő legyen
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">${msg}</div>`;
}