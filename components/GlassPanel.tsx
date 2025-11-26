
import React, { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  border?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  active?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  intensity = 'medium',
  border = true,
  hoverEffect = false,
  onClick,
  onMouseEnter,
  active = false
}) => {
  // Material Physics: Frosted Card look
  // Reduced transparency for a more "Physical" plastic feel, less ephemeral.
  const backdropMap = {
    low: 'backdrop-blur-md bg-black/40',
    medium: 'backdrop-blur-xl bg-white/[0.02] backdrop-saturate-100', 
    high: 'backdrop-blur-2xl bg-white/[0.04] backdrop-saturate-100',
  };

  // Border: Subtle rim lighting
  const borderClass = border 
    ? 'border border-white/10 border-t-white/20 border-b-black/50 shadow-lg' 
    : '';

  // Refined Hover: Physical lift, Matte finish, NO tacky gloss animation.
  const hoverClasses = hoverEffect && !active
    ? 'hover:bg-white/[0.05] hover:border-white/20 hover:shadow-xl hover:-translate-y-[2px] cursor-pointer z-10' 
    : '';

  // Active State: "Plugged In"
  // Updated shadow to rgba(247,148,29,0.1) which is #F7941D
  const activeClasses = active
    ? 'bg-bitcoin-orange/5 border-bitcoin-orange/40 shadow-[0_0_20px_-5px_rgba(247,148,29,0.1)] z-20' 
    : '';

  // Tactile Press
  const clickClasses = onClick 
    ? 'active:scale-[0.98] active:shadow-sm transition-all duration-200 ease-out' 
    : '';

  return (
    <div 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        rounded-2xl
        ${backdropMap[intensity]} 
        ${borderClass} 
        ${className}
        ${hoverClasses}
        ${activeClasses}
        ${clickClasses}
        relative
        overflow-hidden
        group/card
        transform-gpu
        transition-all
        duration-300
      `}
    >
      {/* Static Lamination Sheen (Subtle, not animated) */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/20 pointer-events-none" />

      {/* Noise Grain Texture - Matte Finish */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;
