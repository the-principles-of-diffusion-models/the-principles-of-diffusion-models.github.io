import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/** 1) KaTeX base CSS */
import 'katex/dist/katex.min.css';

/** 2) Your KaTeX overrides MUST come after KaTeX */
import './katex-theme.css';

/** 3) Tailwind / site styles */
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
