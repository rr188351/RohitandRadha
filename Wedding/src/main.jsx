import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { LanguageProvider } from './i18n/index.jsx';
import './styles/main.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The language layer wraps everything, so any component may ask for the
        invitation's words in the guest's own language. */}
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
