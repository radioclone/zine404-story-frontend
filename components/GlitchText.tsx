import React, { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  glitchColors?: [string, string]; // Allow custom colors for tonal balance
  autoGlitch?: boolean; // New prop for autonomous glitching
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  as = 'h1', 
  className = '',
  glitchColors = ['text-burnt-orange', 'text-bitcoin-orange'], // Default to theme
  autoGlitch = false
}) => {
  const Tag = as;
  const [color1, color2] = glitchColors;
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!autoGlitch) return;

    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300); // Glitch duration
      
      // Randomize next glitch interval (between 2s and 8s)
      const nextGlitch = Math.random() * 6000 + 2000;
      setTimeout(triggerGlitch, nextGlitch);
    };

    const timer = setTimeout(triggerGlitch, 2000);
    return () => clearTimeout(timer);
  }, [autoGlitch]);
  
  return (
    <div className={`relative inline-block group ${className}`}>
      <Tag className="relative z-10">{text}</Tag>
      
      {/* Layer 1: The "Ghost" Glitch */}
      <Tag className={`
        absolute top-0 left-0 -z-10 w-full h-full ${color1} 
        opacity-0 translate-x-[2px]
        ${isGlitching ? 'opacity-70 animate-glitch' : 'group-hover:opacity-70 group-hover:animate-glitch'}
      `}>
        {text}
      </Tag>
      
      {/* Layer 2: The "Hard" Glitch */}
      <Tag className={`
        absolute top-0 left-0 -z-10 w-full h-full ${color2} 
        opacity-0 translate-x-[-2px] delay-75
        ${isGlitching ? 'opacity-70 animate-glitch' : 'group-hover:opacity-70 group-hover:animate-glitch'}
      `}>
        {text}
      </Tag>
    </div>
  );
};

export default GlitchText;