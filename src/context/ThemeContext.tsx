import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define la paleta de colores para cada tema
const palettes = {
  light: {
    background: '#ffffff',
    textPrimary: '#1a1a1a',
    textSecondary: '#4a5568',
    primary: '#d69e2e', // Naranja más oscuro para mejor contraste
    accent: '#f59e0b', // Amarillo/Naranja más claro
    headerBg: 'rgba(255, 255, 255, 0.72)', 
    headerBorder: 'rgba(0, 0, 0, 0.08)',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0, 0, 0, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    icon: '#2d3748',
    toggleBg: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.85)',
    primary: '#fbbf24', // Amarillo/Naranja para contraste
    accent: '#f59e0b',
    headerBg: 'rgba(0, 0, 0, 0.6)',
    headerBorder: 'rgba(255, 255, 255, 0.08)',
    cardBg: 'rgba(0, 0, 0, 0.3)',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    icon: '#fbbf24',
    toggleBg: 'rgba(255, 255, 255, 0.1)',
  }
};

// Define el tipo para el valor del contexto
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof palettes.light; // Los colores corresponderán a la estructura de una paleta
}

// Crea el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props para el ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// Proveedor del tema
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme as 'light' | 'dark') || 'light'; // Iniciar en modo claro por defecto
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Add smooth transition styles to root for theme changes
    const style = document.createElement('style');
    style.id = 'theme-transition-styles';
    
    // Remove existing style if present
    const existingStyle = document.getElementById('theme-transition-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    style.textContent = `
      *, *::before, *::after {
        transition: 
          background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          background 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          border-color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          fill 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          stroke 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Preserve explicit transitions and animations */
      [style*="transition"],
      .no-theme-transition,
      [class*="animate-"],
      [class*="animation-"] {
        /* These keep their own transitions */
      }

      /* Smooth backdrop-filter transitions */
      [style*="backdrop-filter"] {
        transition: 
          backdrop-filter 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          -webkit-backdrop-filter 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          background-color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          background 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          border-color 1.5s cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;

    document.head.appendChild(style);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Selecciona la paleta de colores basada en el tema actual
  const colors = palettes[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
