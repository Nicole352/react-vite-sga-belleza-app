import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { colors } = useTheme();

  return (
    <>
      <style>{`
        :root {
          --background: ${colors.background};
          --text-primary: ${colors.textPrimary};
          --text-secondary: ${colors.textSecondary};
          --primary: ${colors.primary};
          --accent: ${colors.accent};
          --header-bg: ${colors.headerBg};
          --header-border: ${colors.headerBorder};
          --card-bg: ${colors.cardBg};
          --card-border: ${colors.cardBorder};
          --shadow: ${colors.shadow};
          --icon: ${colors.icon};
          --toggle-bg: ${colors.toggleBg};
        }

        html {
          background: var(--background);
          transition: background 0.4s ease;
        }

        body {
          background: var(--background);
          color: var(--text-secondary);
          transition: background 0.4s ease, color 0.4s ease;
          margin: 0;
          padding: 0;
        }

        .public-theme-wrapper h1,
        .public-theme-wrapper h2,
        .public-theme-wrapper h3,
        .public-theme-wrapper h4,
        .public-theme-wrapper h5,
        .public-theme-wrapper h6,
        .public-theme-wrapper .text-primary {
          color: var(--text-primary);
        }

        .public-theme-wrapper p,
        .public-theme-wrapper span,
        .public-theme-wrapper div:not([class*="-icon"]),
        .public-theme-wrapper .text-secondary {
          color: var(--text-secondary);
        }

        .public-theme-wrapper .card-background {
            background-color: var(--card-bg);
            border: 1px solid var(--card-border);
        }
      `}</style>
      <div className="public-theme-wrapper">
        {children}
      </div>
    </>
  );
};

export default ThemeWrapper;
