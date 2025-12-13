
import { useRef, useState, useCallback, useEffect } from 'react';

export const useAudioStream = (onInputData: (base64: string) => void) => {
    const [volume, setVolume] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

    // Helper: Float32 -> Int16 PCM
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

    // Helper: Base64 -> AudioBuffer
    const decodeAudio = (base64String: string, ctx: AudioContext): AudioBuffer => {
        const binaryString = window.atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768.0;
        }
        const buffer = ctx.createBuffer(1, float32.length, 24000); // Gemini Output Rate
        buffer.copyToChannel(float32, 0);
        return buffer;
    };

    const initContexts = async () => {
        const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!inputContextRef.current) inputContextRef.current = new AudioCtor({ sampleRate: 16000 });
        if (!outputContextRef.current) outputContextRef.current = new AudioCtor({ sampleRate: 24000 });
        
        if (inputContextRef.current.state === 'suspended') await inputContextRef.current.resume();
        if (outputContextRef.current.state === 'suspended') await outputContextRef.current.resume();
    };

    const startStream = useCallback(async () => {
        try {
            await initContexts();
            const inputCtx = inputContextRef.current!;
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    sampleRate: 16000, 
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            inputSourceRef.current = inputCtx.createMediaStreamSource(stream);
            processorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);

            processorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Volume Meter
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                setVolume(Math.sqrt(sum / inputData.length));

                // Encode & Callback
                const pcm16 = floatTo16BitPCM(inputData);
                const base64 = base64Encode(pcm16.buffer);
                onInputData(base64);
            };

            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputCtx.destination);
        } catch (e) {
            console.error("Audio Stream Error", e);
        }
    }, [onInputData]);

    const stopStream = useCallback(() => {
        if (processorRef.current && inputSourceRef.current) {
            inputSourceRef.current.disconnect();
            processorRef.current.disconnect();
            processorRef.current = null;
            inputSourceRef.current = null;
        }
        clearQueue();
        setVolume(0);
    }, []);

    const playAudioChunk = useCallback((base64: string) => {
        const ctx = outputContextRef.current;
        if (!ctx) return;

        setIsSpeaking(true);
        const buffer = decodeAudio(base64, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;
        const start = Math.max(now, nextStartTimeRef.current);
        source.start(start);
        nextStartTimeRef.current = start + buffer.duration;

        source.onended = () => {
            activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
            if (activeSourcesRef.current.length === 0 && ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                setIsSpeaking(false);
            }
        };
        activeSourcesRef.current.push(source);
    }, []);

    const clearQueue = useCallback(() => {
        activeSourcesRef.current.forEach(s => {
            try { s.stop(); } catch(e) {}
        });
        activeSourcesRef.current = [];
        nextStartTimeRef.current = 0;
        setIsSpeaking(false);
    }, []);

    return { startStream, stopStream, playAudioChunk, clearQueue, volume, isSpeaking };
};
