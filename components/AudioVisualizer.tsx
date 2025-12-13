
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

    // Use a smaller FFT size for chunkier, more responsive retro feel
    const bufferLength = analyser.frequencyBinCount; // 1024 if fftSize is 2048
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // CONFIG FOR RETRO LED LOOK
    const barCount = 32; // Fixed number of columns (32-band EQ style)
    const gap = 2; // Pixel gap between columns
    const barWidth = (canvas.width - (barCount * gap)) / barCount;
    const segmentHeight = 4; // Height of each "LED" pixel
    const segmentGap = 1; // Gap between vertical segments

    for (let i = 0; i < barCount; i++) {
      // Map the 32 bars logarithmically across the frequency spectrum
      const logIndex = Math.floor(Math.pow(i / barCount, 1.8) * (bufferLength / 2));
      const value = dataArray[logIndex] || 0;
      
      const percent = value / 255;
      const totalHeight = percent * canvas.height;
      const numSegments = Math.floor(totalHeight / (segmentHeight + segmentGap));

      const x = i * (barWidth + gap);

      // Draw segments from bottom up
      for (let j = 0; j < numSegments; j++) {
        const y = canvas.height - (j * (segmentHeight + segmentGap)) - segmentHeight;
        
        // Color Logic: Green -> Yellow -> Red (Classic VU Meter)
        // or Monochrome: Opacity based on height
        let color = 'rgba(255, 255, 255, 0.3)'; // Base Low
        const segmentPercent = j / (canvas.height / (segmentHeight + segmentGap));
        
        if (segmentPercent > 0.5) color = 'rgba(255, 255, 255, 0.6)'; // Mid
        if (segmentPercent > 0.8) color = '#F7931A'; // Peak (Bitcoin Orange)

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, segmentHeight);
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isListening && analyser) {
        draw();
    } else {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        // Clear canvas if stopped
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening, analyser]);

  return (
    <div className="w-full h-full relative group cursor-pointer" onClick={startListening}>
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={100} 
            className="w-full h-full block"
        />
        {!isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-bitcoin-orange/10 border border-bitcoin-orange/50 px-3 py-1 rounded backdrop-blur-sm">
                    <span className="font-pixel text-lg text-bitcoin-orange animate-pulse">INIT_AUDIO_SYSTEM</span>
                 </div>
            </div>
        )}
    </div>
  );
};

export default AudioVisualizer;
