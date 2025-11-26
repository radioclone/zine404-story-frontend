import React, { ReactNode, useState } from 'react';
import PhaserBackground from './PhaserBackground';

interface SpatialShellProps {
  children: ReactNode;
}

const SpatialShell: React.FC<SpatialShellProps> = ({ children }) => {
  // The Shell now purely manages the background environment
  // Content is rendered by App.tsx to allow for cleaner Z-indexing and transitions
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Layer */}
      <PhaserBackground active={true} />
      
      {/* Global Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />
      
      {/* Children (if any) */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default SpatialShell;