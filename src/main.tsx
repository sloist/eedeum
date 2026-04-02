import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'

// Disable browser's automatic scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Restore saved theme and font size
const savedTheme = localStorage.getItem("eedeum_theme");
if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
const savedFont = localStorage.getItem("eedeum_fontsize");
if (savedFont) document.documentElement.setAttribute("data-fontsize", savedFont);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
