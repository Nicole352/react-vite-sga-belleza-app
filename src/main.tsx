import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.css';
import App from './App.tsx';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Apply initial theme before React renders to avoid flashes
(() => {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  } catch {}
})();

// More robust adjustment for inline-styled elements (e.g., Cursos page) on initial load
function adjustInlineThemedElementsOnLoad() {
  try {
    const doc = document;
    // Fix page-level gradients that are hard-coded to dark colors
    for (const el of Array.from(doc.querySelectorAll('div[style]'))) {
      const style = (el as HTMLElement).style;
      const bg = style.background || style.backgroundImage || '';
      const isLinear = bg.includes('linear-gradient(');
      const hasDarkHex = bg.includes('#000') || bg.includes('#1a1a1a');
      const hasDarkRgb = bg.includes('rgb(0, 0, 0)') || bg.includes('rgb(26, 26, 26)');
      if (isLinear && (hasDarkHex || hasDarkRgb)) {
        style.background = 'linear-gradient(135deg, var(--page-grad-from) 0%, var(--page-grad-mid) 50%, var(--page-grad-to) 100%)';
      }
      // Replace common solid backgrounds
      const solids = ['#0b0b0b','rgb(11, 11, 11)','#0d0d0d','rgb(13, 13, 13)','#151515','rgb(21, 21, 21)','#000','rgb(0, 0, 0)'];
      if (solids.includes(bg.trim())) {
        // card surfaces
        if (bg.includes('151515')) style.background = 'var(--surface-2)';
        else style.background = 'var(--surface-1)';
      }
    }
    // Borders
    for (const el of Array.from(doc.querySelectorAll('[style*="border: 1px solid #222"], [style*="border: 1px solid rgb(34, 34, 34)"]'))) {
      (el as HTMLElement).style.border = '1px solid var(--border)';
    }
    // Text whites to themed foreground
    for (const el of Array.from(doc.querySelectorAll('[style*="color: rgba(255, 255, 255"], [style*="color: rgba(255,255,255"], [style*="color: #fff"], [style*="color: white"]'))) {
      (el as HTMLElement).style.color = 'var(--fg)';
    }
  } catch {}
}

AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 40 });
window.addEventListener('load', () => {
  AOS.refresh();
  // Run after load to ensure DOM is present
  adjustInlineThemedElementsOnLoad();
  // Also re-run shortly after to catch late mounts
  setTimeout(adjustInlineThemedElementsOnLoad, 50);
  // Observe DOM changes (route changes, lazy mounts) and adjust
  try {
    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        adjustInlineThemedElementsOnLoad();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch {}
});

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root container with id 'root' not found");
}
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
