
import { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export const useLiveAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);

  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const currentSession = useRef<any>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const inputSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTime = useRef<number>(0);
  
  // Helper: Float32 -> Int16 PCM (Input)
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  // Helper: ArrayBuffer -> Base64
  const base64Encode = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Base64 -> AudioBuffer (Output)
  const decodeAudio = (base64String: string, ctx: AudioContext): AudioBuffer => {
    const binaryString = window.atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Gemini returns raw Int16 PCM
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
    }

    // Create buffer at 24kHz (Gemini Output Rate)
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);
    return buffer;
  };

  const initAudioContexts = async () => {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    
    if (!inputContextRef.current) {
      inputContextRef.current = new AudioCtor({ sampleRate: 16000 });
    }
    if (!outputContextRef.current) {
      outputContextRef.current = new AudioCtor({ sampleRate: 24000 });
    }

    if (inputContextRef.current.state === 'suspended') await inputContextRef.current.resume();
    if (outputContextRef.current.state === 'suspended') await outputContextRef.current.resume();
  };

  const connect = async () => {
    try {
      await initAudioContexts();
      const inputCtx = inputContextRef.current!;
      const outputCtx = outputContextRef.current!;

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
              sampleRate: 16000, 
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
          } 
      });

      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are the voice of 'Electronic Hollywood'. You are a cyberpunk creative assistant helping a user build their IP. Your voice is precise, cool, and helpful. Keep responses concise.",
        }
      };

      const session = await ai.live.connect({ 
          ...config, 
          callbacks: {
            onopen: async () => {
                setIsConnected(true);
                
                inputSource.current = inputCtx.createMediaStreamSource(stream);
                // Use larger buffer size for stability
                processor.current = inputCtx.createScriptProcessor(4096, 1, 1);
                
                processor.current.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Simple Volume Meter
                    let sum = 0;
                    for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                    setVolume(Math.sqrt(sum / inputData.length));

                    // Encode and Send
                    const pcm16 = floatTo16BitPCM(inputData);
                    const base64 = base64Encode(pcm16.buffer);
                    
                    session.sendRealtimeInput({
                        media: {
                            mimeType: "audio/pcm;rate=16000",
                            data: base64
                        }
                    });
                };
                
                inputSource.current.connect(processor.current);
                processor.current.connect(inputCtx.destination);
            },
            onmessage: (msg: LiveServerMessage) => {
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    setIsSpeaking(true);
                    const buffer = decodeAudio(audioData, outputCtx);
                    
                    const source = outputCtx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputCtx.destination);
                    
                    const now = outputCtx.currentTime;
                    // Schedule playback to prevent overlap/gaps
                    const start = Math.max(now, nextStartTime.current);
                    source.start(start);
                    nextStartTime.current = start + buffer.duration;
                    
                    source.onended = () => {
                        if (outputCtx.currentTime >= nextStartTime.current - 0.1) {
                            setIsSpeaking(false);
                        }
                    };
                }
            },
            onclose: () => {
                setIsConnected(false);
                setIsSpeaking(false);
            },
            onerror: (e: any) => {
                console.error("Live API Error", e);
                setIsConnected(false);
            }
          }
      });

      currentSession.current = session;

    } catch (e) {
        console.error("Connection Failed", e);
        setIsConnected(false);
    }
  };

  const disconnect = () => {
      if (currentSession.current) {
        // Close logic if available or just drop ref
        currentSession.current = null;
      }
      if (processor.current && inputSource.current) {
          inputSource.current.disconnect();
          processor.current.disconnect();
      }
      setIsConnected(false);
      setIsSpeaking(false);
      setVolume(0);
      nextStartTime.current = 0;
  };

  useEffect(() => {
      return () => disconnect();
  }, []);

  return { connect, disconnect, isConnected, isSpeaking, volume };
};
