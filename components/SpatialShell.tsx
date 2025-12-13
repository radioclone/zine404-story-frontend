
import React, { ReactNode } from 'react';

interface SpatialShellProps {
  children: ReactNode;
}

const SpatialShell: React.FC<SpatialShellProps> = ({ children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* --- STATIC BACKGROUND --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212] via-[#0a0a0a] to-black z-0" />
      
      {/* Optional: Subtle Pixel Grid for texture */}
      <div className="absolute inset-0 bg-pixel-grid opacity-5 pointer-events-none z-0" />

      {/* --- ATMOSPHERE --- */}
      {/* Global Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-[2] mix-blend-multiply" 
        style={{ 
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.8) 100%)',
        }}
      />
      
      {/* CRT Scanline/Noise Effect */}
      <div className="absolute inset-0 pointer-events-none z-[2] opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Children (App Content) */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default SpatialShell;
