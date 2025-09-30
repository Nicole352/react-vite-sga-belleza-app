import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AOS from 'aos';
import { ThemeProvider } from './context/ThemeContext';

AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 40 });
window.addEventListener('load', () => AOS.refresh());

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root container with id 'root' not found");
}
ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
