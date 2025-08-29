import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 40 });
window.addEventListener('load', () => AOS.refresh());

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
