import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ✅ Load KaTeX base styles ONCE, globally.
// IMPORTANT: load BEFORE your own css so your overrides can win.
import 'katex/dist/katex.min.css';

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
