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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered: ', registration);
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
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
