import { useRef, useState, useEffect, useCallback } from 'react';

export const useAudioInput = () => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analysisLoopRef = useRef<number | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate Bass (Low Freq)
    let bassSum = 0;
    // 2048 FFT size -> bin size ~ 24Hz (48000/2048)
    // Bass: 0-150Hz -> approx bins 0-6
    for (let i = 0; i < 10; i++) bassSum += dataArray[i];
    // Normalize (assuming sum max is 10 * 255 = 2550)
    const bassNormalized = Math.min(1, (bassSum / 10) / 200); 

    // Calculate Treble (High Freq)
    let trebleSum = 0;
    // Highs: 8kHz+ -> bins 300+
    for (let i = 200; i < 300; i++) trebleSum += dataArray[i];
    const trebleNormalized = Math.min(1, (trebleSum / 100) / 150);

    // Dispatch Event
    const event = new CustomEvent('audio-reactivity', { 
        detail: { bass: bassNormalized, treble: trebleNormalized } 
    });
    window.dispatchEvent(event);

    analysisLoopRef.current = requestAnimationFrame(analyze);
  }, []);

  const startListening = async () => {
    if (isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      setIsListening(true);
      analyze(); // Start global analysis loop
    } catch (err) {
      console.error("Mic Error:", err);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
        if (analysisLoopRef.current) cancelAnimationFrame(analysisLoopRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (sourceRef.current) sourceRef.current.disconnect();
    }
  }, [analyze]);

  return { isListening, startListening, analyserRef };
};