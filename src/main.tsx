import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        if (registration.active) {
          registration.active.postMessage({ type: 'PRECACHE_MODEL' });
        }
      });
    } else {
      if (registration.active) {
        registration.active.postMessage({ type: 'PRECACHE_MODEL' });
      }
    }
  });
}
