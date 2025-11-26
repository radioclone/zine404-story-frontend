
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  startListening: () => void;
  analyser: AnalyserNode | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening, startListening, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const draw = () => {
    if (!canvasRef.current || !analyser) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = 3;
    const gap = 1;
    let x = 0;
    const bars = Math.floor(canvas.width / (barWidth + gap));
    
    for (let i = 0; i < bars; i++) {
      const index = Math.floor((i / bars) * (bufferLength / 1.5)); 
      const value = dataArray[index];
      const percent = value / 255;
      const height = percent * canvas.height;

      let color = 'rgba(40, 40, 40, 0.5)';
      if (percent > 0.3) color = '#A05A05'; // Dark shade of F7941D
      if (percent > 0.7) color = '#CA7A15'; // Medium shade
      if (percent > 0.9) color = '#F7941D'; // Main orange

      ctx.fillStyle = color;
      ctx.fillRect(x, canvas.height - height, barWidth, height);
      x += barWidth + gap;
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isListening && analyser) {
        draw();
    } else {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, analyser]);

  return (
    <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-end px-1 border-b border-bitcoin-orange/30 pb-2">
            <div className="font-mono text-[10px] text-bitcoin-orange tracking-widest uppercase">
                SOURCE INPUT
            </div>
            <div className="font-mono text-[10px] text-gray-500 uppercase">
                {isListening ? 'ACTIVE' : 'MUTED'}
            </div>
        </div>
        <div className="w-full h-32 bg-black border border-white/10 relative group overflow-hidden">
            <canvas 
                ref={canvasRef} 
                width={600} 
                height={128} 
                className="w-full h-full opacity-90"
            />
            
            {!isListening && (
                <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/60 backdrop-blur-[2px] hover:bg-black/40 transition-all z-10"
                onClick={startListening}
                >
                <div className="flex flex-col items-center space-y-2 group-hover:scale-105 transition-transform">
                    <span className="font-mono text-[10px] text-bitcoin-orange tracking-[0.2em] animate-pulse border border-bitcoin-orange px-3 py-1">ACTIVATE MIC</span>
                </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AudioVisualizer;
