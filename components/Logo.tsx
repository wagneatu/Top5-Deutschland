
import React from 'react';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  compact?: boolean;
}

/**
 * Logo-Komponente für Top5Deutschland.
 * Nutzt das Original-Logo von der bereitgestellten URL.
 */
const Logo: React.FC<LogoProps> = ({ className = "h-12", showSlogan = false, compact = false }) => {
  const logoUrl = "https://carskin.de/wp-content/uploads/2026/01/LogoSVG.svg";

  return (
    <div className={`flex flex-col items-start justify-center ${className} select-none`}>
      <img 
        src={logoUrl} 
        alt="Top 5 Deutschland Logo" 
        className="h-full w-auto object-contain transition-all duration-300"
        draggable={false}
        onError={(e) => {
          console.error("Logo konnte nicht geladen werden.");
          // Fallback-Anzeige falls die URL mal nicht erreichbar ist
          e.currentTarget.style.display = 'none';
        }}
      />

      {showSlogan && !compact && (
        <p className="text-white/40 text-[10px] mt-3 font-medium tracking-[0.25em] uppercase whitespace-nowrap">
          Die begehrtesten Plätze der Stadt
        </p>
      )}
    </div>
  );
};

export default Logo;
