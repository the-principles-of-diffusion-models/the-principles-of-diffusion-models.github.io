import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// KaTeX base styles (needed by react-katex)
import 'katex/dist/katex.min.css';

// Your dark-mode fix (forces KaTeX/MathJax to inherit text color in dark mode)
import './styles/math-dark.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
