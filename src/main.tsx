import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppDataProvider } from './contexts/AppDataContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <App />
    </AppDataProvider>
  </StrictMode>,
);
