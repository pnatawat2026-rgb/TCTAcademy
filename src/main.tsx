import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';
import { forceHardRefreshAndPurgeCache } from './utils/appVersionManager';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

// Expose force refresh utility globally on window for manual debugging/support
if (typeof window !== 'undefined') {
  (window as any).__forceRefreshApp = forceHardRefreshAndPurgeCache;
}

// Register Service Worker gracefully without forcing disruptive reload loops
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Check for worker updates in background
      reg.update().catch(() => {});
    }).catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}
