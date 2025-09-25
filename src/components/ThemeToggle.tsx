import React, { useEffect, useMemo, useState } from 'react';
import { AiFillSun, AiOutlineMoon } from 'react-icons/ai';

// Util keys
const STORAGE_KEY = 'theme'; // values: 'light' | 'dark'

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  // After toggling theme class, adjust known inline-styled elements (e.g., Cursos page)
  try { adjustInlineThemedElements(); } catch {}
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return getSystemPrefersDark() ? 'dark' : 'light';
}

const buttonBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 9999,
  width: 44,
  height: 44,
  background: 'var(--btn-bg)',
  color: 'var(--btn-fg)',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
};

const ThemeToggle: React.FC<{ className?: string; label?: string }>= ({ className, label }) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // sync to DOM and storage
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  // react to system changes if user didn't pick manually in this session
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, []);

  const isDark = theme === 'dark';
  const next = isDark ? 'light' : 'dark';
  const title = useMemo(() => (isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'), [isDark]);

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={title}
      title={title}
      className={className}
      style={buttonBase}
    >
      {isDark ? (
        <AiFillSun size={20} style={{ display: 'block' }} />
      ) : (
        <AiOutlineMoon size={20} style={{ display: 'block' }} />
      )}
    </button>
  );
};

export default ThemeToggle;

// --- Helpers to adjust inline styles in pages with fixed colors ---
function adjustInlineThemedElements() {
  const doc = document;
  // Replace page-level dark gradient backgrounds with variable-driven gradient
  for (const el of Array.from(doc.querySelectorAll('div[style]'))) {
    const style = (el as HTMLElement).style;
    const bg = style.background || style.backgroundImage;
    if (!bg) continue;
    if (bg.includes('linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)')) {
      style.background = 'linear-gradient(135deg, var(--page-grad-from) 0%, var(--page-grad-mid) 50%, var(--page-grad-to) 100%)';
    }
    if (bg.trim() === '#0b0b0b' || bg.trim() === 'rgb(11, 11, 11)') {
      style.background = 'var(--surface-1)';
    }
    if (bg.trim() === '#0d0d0d' || bg.trim() === 'rgb(13, 13, 13)') {
      style.background = 'var(--surface-1)';
    }
    if (bg.trim() === '#151515' || bg.trim() === 'rgb(21, 21, 21)') {
      style.background = 'var(--surface-2)';
    }
    if (bg.trim() === '#000' || bg.trim() === 'rgb(0, 0, 0)') {
      style.background = 'var(--surface-1)';
    }
  }
  // Adjust borders commonly used
  for (const el of Array.from(doc.querySelectorAll('[style*="border: 1px solid #222"], [style*="border: 1px solid rgb(34, 34, 34)"]'))) {
    (el as HTMLElement).style.border = '1px solid var(--border)';
  }
  // Adjust text colors with fixed white/rgba to themed foreground
  for (const el of Array.from(doc.querySelectorAll('[style*="color: rgba(255,255,255"], [style*="color: #fff"], [style*="color: white"]'))) {
    (el as HTMLElement).style.color = 'var(--fg)';
  }
}
