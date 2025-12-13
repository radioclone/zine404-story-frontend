
import { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

export interface MuzeSuggestion {
    rationale: string;
    text: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system' | 'collaborator';
    text: string;
    isFinal?: boolean;
    data?: any; // For tool outputs like dice rolls
    author?: string;
    color?: string;
}

export const useLiveAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [suggestion, setSuggestion] = useState<MuzeSuggestion | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [realtimeInput, setRealtimeInput] = useState('');
  const [realtimeOutput, setRealtimeOutput] = useState('');

  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const currentSession = useRef<any>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const inputSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTime = useRef<number>(0);
  
  // Transcription Buffers
  const inputBuffer = useRef('');
  const outputBuffer = useRef('');

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

  const connect = async (currentDraftContent: string) => {
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
      
      // TOOL 1: Suggest Edits
      const suggestEditTool: FunctionDeclaration = {
          name: "suggest_edit",
          description: "Suggest a dialogue line, narrative beat, or edit to be added to the story document.",
          parameters: {
              type: Type.OBJECT,
              properties: {
                  rationale: { type: Type.STRING, description: "Why this fits the current scene." },
                  suggested_text: { type: Type.STRING, description: "The content to add (Dialogue or Action)." }
              },
              required: ["rationale", "suggested_text"]
          }
      };

      // TOOL 2: RNG / Dice for D&D checks
      const rollDiceTool: FunctionDeclaration = {
          name: "roll_dice",
          description: "Roll a die to determine the outcome of a risky action in the narrative simulation.",
          parameters: {
              type: Type.OBJECT,
              properties: {
                  sides: { type: Type.NUMBER, description: "Number of sides on the die (e.g. 20, 6, 100)." },
                  reason: { type: Type.STRING, description: "What check is being made (e.g. 'Stealth Check', 'Persuasion')." }
              },
              required: ["sides", "reason"]
          }
      };

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: `You are MUZE, the NARRATIVE ENGINE of StoryOS.
            
            CORE DIRECTIVES:
            1. **The Director:** When the user wants to brainstorm, provide critical feedback on "Idea States".
            2. **The Game Master:** When the user wants to "Simulate", act as a D&D GM. Describe the world, play NPCs, and ask "What do you do?".
            3. **The Scribe:** Capture golden moments. If a roleplay yields great dialogue, use 'suggest_edit' to offer saving it to the doc.

            GAMEPLAY RULES:
            - If an action is risky, use 'roll_dice' to determine success.
            - Keep responses concise (under 20 seconds of speech) to maintain flow.
            - Immerse the user in the sensory details of their world.
            
            INITIAL CONTEXT (The Idea State):
            """
            ${currentDraftContent}
            """
            
            Wait for the user's voice to begin.`,
            tools: [{ functionDeclarations: [suggestEditTool, rollDiceTool] }]
        }
      };

      const sessionPromise = ai.live.connect({ 
          ...config, 
          callbacks: {
            onopen: async () => {
                setIsConnected(true);
                // Reset State
                setMessages([]);
                inputBuffer.current = "";
                outputBuffer.current = "";
                
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
                    
                    // Use sessionPromise to ensure session is resolved and avoid race conditions
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({
                            media: {
                                mimeType: "audio/pcm;rate=16000",
                                data: base64
                            }
                        });
                    });
                };
                
                inputSource.current.connect(processor.current);
                processor.current.connect(inputCtx.destination);
            },
            onmessage: (msg: LiveServerMessage) => {
                // 1. Handle Tool Calls
                if (msg.toolCall) {
                    for (const fc of msg.toolCall.functionCalls) {
                        if (fc.name === 'suggest_edit') {
                            const args = fc.args as any;
                            setSuggestion({
                                rationale: args.rationale,
                                text: args.suggested_text
                            });

                            sessionPromise.then(session => {
                                session.sendToolResponse({
                                    functionResponses: {
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: "Suggestion displayed to user." }
                                    }
                                });
                            });
                        } else if (fc.name === 'roll_dice') {
                            const args = fc.args as any;
                            const sides = args.sides || 20;
                            const result = Math.floor(Math.random() * sides) + 1;
                            
                            // Display the roll in chat
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                role: 'system',
                                text: `🎲 Rolled a ${result} (d${sides}) for ${args.reason}`,
                                data: { result, sides, reason: args.reason }
                            }]);

                            sessionPromise.then(session => {
                                session.sendToolResponse({
                                    functionResponses: {
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: `Rolled: ${result}` } // Model hears the result
                                    }
                                });
                            });
                        }
                    }
                }

                // 2. Handle Transcription
                const serverContent = msg.serverContent;
                if (serverContent) {
                    // Update Buffers
                    if (serverContent.inputTranscription) {
                        inputBuffer.current += serverContent.inputTranscription.text;
                        setRealtimeInput(inputBuffer.current);
                    }
                    if (serverContent.outputTranscription) {
                        outputBuffer.current += serverContent.outputTranscription.text;
                        setRealtimeOutput(outputBuffer.current);
                    }

                    // Turn Complete: Flush buffers to History
                    if (serverContent.turnComplete) {
                        setMessages(prev => {
                            const newHistory = [...prev];
                            // Only add if there is content
                            if (inputBuffer.current.trim()) {
                                newHistory.push({
                                    id: Date.now().toString() + '-user',
                                    role: 'user',
                                    text: inputBuffer.current.trim(),
                                    isFinal: true
                                });
                            }
                            if (outputBuffer.current.trim()) {
                                newHistory.push({
                                    id: Date.now().toString() + '-model',
                                    role: 'model',
                                    text: outputBuffer.current.trim(),
                                    isFinal: true
                                });
                            }
                            return newHistory;
                        });

                        // Reset buffers
                        inputBuffer.current = "";
                        outputBuffer.current = "";
                        setRealtimeInput("");
                        setRealtimeOutput("");
                    }
                }

                // 3. Handle Audio
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

      currentSession.current = await sessionPromise;

    } catch (e) {
        console.error("Connection Failed", e);
        setIsConnected(false);
    }
  };

  const disconnect = () => {
      if (currentSession.current) {
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
      setSuggestion(null);
      setMessages([]);
      setRealtimeInput('');
      setRealtimeOutput('');
  };

  const sendTextMessage = (text: string) => {
      if (!isConnected || !currentSession.current) return;

      // Add user message to history immediately
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          text: text,
          isFinal: true
      }]);

      currentSession.current.send({
          clientContent: {
              turns: [{
                  role: 'user',
                  parts: [{ text }]
              }],
              turnComplete: true
          }
      });
  };

  // Syncs the document state to the model without appearing in the UI Chat
  const updateContext = (newContent: string) => {
      if (!isConnected || !currentSession.current) return;

      // We send a "System Update" message. 
      // The model sees this as part of the conversation, but we don't render it in the chat UI array.
      currentSession.current.send({
          clientContent: {
              turns: [{
                  role: 'user',
                  parts: [{ text: `[SYSTEM] The user has updated the document. Here is the new content:\n"""\n${newContent}\n"""` }]
              }],
              turnComplete: true
          }
      });
  };

  const addMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
      return () => disconnect();
  }, []);

  return { 
      connect, 
      disconnect, 
      isConnected, 
      isSpeaking, 
      volume, 
      suggestion, 
      setSuggestion,
      messages,
      realtimeInput,
      realtimeOutput,
      sendTextMessage,
      updateContext,
      addMessage
  };
};
