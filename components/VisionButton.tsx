
import React from 'react';

interface VisionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  label: string;
  subLabel?: string;
}

const VisionButton: React.FC<VisionButtonProps> = ({ 
  active = false, 
  icon, 
  label, 
  subLabel, 
  className = "",
  ...props 
}) => {
  return (
    <button 
      className={`
        relative overflow-hidden text-left p-6 rounded-3xl transition-all duration-300 ease-out group
        border border-white/10
        ${active 
          ? 'bg-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-[1.02] ring-1 ring-white/30' 
          : 'bg-[#1A1A1A]/40 hover:bg-[#2A2A2A]/60 hover:scale-[1.02] hover:shadow-2xl hover:border-white/20'
        }
        backdrop-blur-2xl backdrop-saturate-150
        flex flex-col h-64 justify-between
        ${className}
      `}
      {...props}
    >
      {/* Specular Shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      {/* Icon Container */}
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-500 ease-out
        ${active ? 'bg-white text-black scale-110' : 'bg-white/10 text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black'}
      `}>
        {icon}
      </div>

      {/* Text Content */}
      <div className="relative z-10">
        <h3 className={`text-xl font-bold mb-2 tracking-tight transition-colors ${active ? 'text-white' : 'text-white/90'}`}>
          {label}
        </h3>
        {subLabel && (
          <p className={`text-sm leading-relaxed font-medium transition-colors ${active ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'}`}>
            {subLabel}
          </p>
        )}
      </div>
    </button>
  );
};

export default VisionButton;
