import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ✅ ONLY import index.css
import 'katex/dist/katex.min.css'  // ✅ Import KaTeX styles
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
