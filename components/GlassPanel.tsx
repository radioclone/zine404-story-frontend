
import React, { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  intensity?: 'thin' | 'regular' | 'thick';
  interactive?: boolean;
  onClick?: () => void;
  active?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  intensity = 'regular',
  interactive = false,
  onClick,
  active = false
}) => {
  // Vision OS Style Depth Hierarchy
  const intensityMap = {
    thin: 'bg-white/[0.03] backdrop-blur-md border-white/[0.08]',
    regular: 'bg-[#1A1A1A]/60 backdrop-blur-2xl backdrop-saturate-150 border-white/[0.12]',
    thick: 'bg-[#0F0F0F]/80 backdrop-blur-3xl backdrop-saturate-200 border-white/[0.15]',
  };

  const interactionClasses = interactive 
    ? 'cursor-pointer hover:bg-white/[0.08] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'
    : '';

  const activeClasses = active
    ? 'ring-1 ring-white/50 bg-white/[0.1] shadow-glow'
    : '';

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[24px] border
        ${intensityMap[intensity]}
        ${interactionClasses}
        ${activeClasses}
        ${className}
      `}
    >
      {/* Specular Highlight Gradient (The "Vision" Shine) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;
