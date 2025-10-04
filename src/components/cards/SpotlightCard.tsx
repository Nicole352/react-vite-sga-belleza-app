import React, { useRef, CSSProperties } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./SpotlightCard.css";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: CSSProperties;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
  children, 
  className = "", 
  spotlightColor = "rgba(255, 255, 255, 0.25)",
  style 
}) => {
  const { theme } = useTheme();
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  const cardStyle: CSSProperties = {
    backgroundColor: theme === 'dark' ? '#111' : '#ffffff',
    borderColor: theme === 'dark' ? '#222' : 'rgba(209, 160, 42, 0.3)',
    ...style
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
      style={cardStyle}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
