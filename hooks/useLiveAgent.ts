
import { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { useAudioStream } from './useAudioStream';

export type AgentMode = 'ARCHITECT' | 'GAME_MASTER' | 'EDITOR';

export interface MuzeSuggestion {
    rationale: string;
    text: string;
    type?: 'DIALOGUE' | 'ACTION' | 'LORE';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system' | 'collaborator';
    text: string;
    isFinal?: boolean;
    data?: any;
    author?: string;
    color?: string;
}

const SYSTEM_PROMPTS: Record<AgentMode, string> = {
    ARCHITECT: `MODE: ARCHITECT (Brainstorming).
    - Goal: Expand the user's world-building and logic.
    - Behavior: Ask Socratic questions. Connect loose dots.
    - Tone: Curious, abstract, foundational.
    - Rules: Do not write prose. Focus on concepts, history, and mechanics.`,
    
    GAME_MASTER: `MODE: GAME MASTER (Simulation).
    - Goal: Immerse the user in the "Idea State" using sensory details.
    - Behavior: Describe the scene. React to user actions. Roll dice for risks.
    - Tone: Cinematic, present-tense, urgent.
    - Rules: Always ask "What do you do?" after a description.`,
    
    EDITOR: `MODE: EDITOR (Critique).
    - Goal: Refine the prose, dialogue, and pacing.
    - Behavior: Analyze selected text or the whole draft. Suggest concrete cuts or rewrites.
    - Tone: Professional, concise, ruthless but constructive.
    - Rules: Use 'suggest_edit' tool for specific text fixes.`
};

export const useLiveAgent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [agentMode, setAgentMode] = useState<AgentMode>('ARCHITECT');
    const [suggestion, setSuggestion] = useState<MuzeSuggestion | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // Transcription State
    const [realtimeInput, setRealtimeInput] = useState('');
    const [realtimeOutput, setRealtimeOutput] = useState('');
    const inputBuffer = useRef('');
    const outputBuffer = useRef('');

    const currentSession = useRef<any>(null);
    
    // Audio Handler
    const { startStream, stopStream, playAudioChunk, clearQueue, volume, isSpeaking } = useAudioStream((base64) => {
        if (currentSession.current) {
            currentSession.current.sendRealtimeInput({
                media: { mimeType: "audio/pcm;rate=16000", data: base64 }
            });
        }
    });

    const connect = async (initialContent: string) => {
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API Key missing");

            const ai = new GoogleGenAI({ apiKey });

            // Tools
            const suggestEditTool: FunctionDeclaration = {
                name: "suggest_edit",
                description: "Propose a concrete text addition or edit.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['DIALOGUE', 'ACTION', 'LORE'] },
                        rationale: { type: Type.STRING },
                        suggested_text: { type: Type.STRING }
                    },
                    required: ["rationale", "suggested_text", "type"]
                }
            };

            const rollDiceTool: FunctionDeclaration = {
                name: "roll_dice",
                description: "Roll a die for a check.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        sides: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
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
                    systemInstruction: `You are MUZE, the Intelligent Narrative Engine of StoryOS.
                    
                    CURRENT CONTEXT:
                    """
                    ${initialContent}
                    """

                    INITIAL BEHAVIOR:
                    ${SYSTEM_PROMPTS['ARCHITECT']}

                    CORE RULES:
                    1. Keep responses under 15s unless narrating.
                    2. Adapt instantly when Mode changes.
                    3. Acknowledge system updates silently.`,
                    tools: [{ functionDeclarations: [suggestEditTool, rollDiceTool] }]
                }
            };

            const sessionPromise = ai.live.connect({
                ...config,
                callbacks: {
                    onopen: async () => {
                        setIsConnected(true);
                        setMessages([]);
                        await startStream();
                    },
                    onmessage: (msg: LiveServerMessage) => {
                        // 1. Interruption
                        if (msg.serverContent?.interrupted) {
                            clearQueue();
                            inputBuffer.current = "";
                            outputBuffer.current = "";
                            setRealtimeOutput("");
                            return;
                        }

                        // 2. Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) playAudioChunk(audioData);

                        // 3. Tools
                        if (msg.toolCall) {
                            for (const fc of msg.toolCall.functionCalls) {
                                if (fc.name === 'suggest_edit') {
                                    const args = fc.args as any;
                                    setSuggestion({ ...args });
                                    sessionPromise.then(s => s.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } }
                                    }));
                                } else if (fc.name === 'roll_dice') {
                                    const args = fc.args as any;
                                    const result = Math.floor(Math.random() * (args.sides || 20)) + 1;
                                    setMessages(p => [...p, {
                                        id: Date.now().toString(), role: 'system', text: `🎲 Rolled ${result} for ${args.reason}`, data: { result }
                                    }]);
                                    sessionPromise.then(s => s.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result: `Rolled: ${result}` } }
                                    }));
                                }
                            }
                        }

                        // 4. Transcription
                        if (msg.serverContent?.inputTranscription) {
                            inputBuffer.current += msg.serverContent.inputTranscription.text;
                            setRealtimeInput(inputBuffer.current);
                        }
                        if (msg.serverContent?.outputTranscription) {
                            outputBuffer.current += msg.serverContent.outputTranscription.text;
                            setRealtimeOutput(outputBuffer.current);
                        }
                        if (msg.serverContent?.turnComplete) {
                            if (inputBuffer.current.trim()) {
                                setMessages(p => [...p, { id: Date.now() + 'u', role: 'user', text: inputBuffer.current.trim(), isFinal: true }]);
                            }
                            if (outputBuffer.current.trim()) {
                                setMessages(p => [...p, { id: Date.now() + 'm', role: 'model', text: outputBuffer.current.trim(), isFinal: true }]);
                            }
                            inputBuffer.current = "";
                            outputBuffer.current = "";
                            setRealtimeInput("");
                            setRealtimeOutput("");
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        stopStream();
                    },
                    onerror: (e) => {
                        console.error(e);
                        setIsConnected(false);
                    }
                }
            });

            currentSession.current = await sessionPromise;

        } catch (e) {
            console.error(e);
            setIsConnected(false);
        }
    };

    const disconnect = () => {
        currentSession.current = null;
        stopStream();
        setIsConnected(false);
        setMessages([]);
        setRealtimeInput("");
        setRealtimeOutput("");
    };

    const sendTextMessage = (text: string) => {
        if (!currentSession.current) return;
        setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text, isFinal: true }]);
        currentSession.current.send({
            clientContent: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true }
        });
    };

    const updateContext = (newContent: string, selection?: string) => {
        if (!currentSession.current) return;
        
        let msg = `[SYSTEM UPDATE] Draft Updated.\nLength: ${newContent.length} chars.`;
        if (selection) {
            msg += `\nUSER FOCUS (Selected Text): """${selection}"""\nTreat this selection as the primary context for your next response.`;
        } else {
            // Only send full content if significantly changed or first load, 
            // but for simplicity in this demo we send full update or diffs.
            // Here we send the whole thing to ensure sync.
            msg += `\nFULL CONTENT:\n"""${newContent}"""`;
        }

        currentSession.current.send({
            clientContent: { turns: [{ role: 'user', parts: [{ text: msg }] }], turnComplete: true }
        });
    };

    const switchMode = (mode: AgentMode) => {
        setAgentMode(mode);
        if (!currentSession.current) return;

        const prompt = `[SYSTEM COMMAND] SWITCH MODE TO: ${mode}.\n\nNEW INSTRUCTIONS:\n${SYSTEM_PROMPTS[mode]}\n\nAcknowledge this shift briefly.`;
        
        currentSession.current.send({
            clientContent: { turns: [{ role: 'user', parts: [{ text: prompt }] }], turnComplete: true }
        });
        
        // Add visual marker to chat
        setMessages(p => [...p, { 
            id: Date.now().toString(), 
            role: 'system', 
            text: `Switched to ${mode} mode.` 
        }]);
    };

    const addMessage = (msg: ChatMessage) => setMessages(p => [...p, msg]);

    return { 
        connect, disconnect, isConnected, isSpeaking, volume, 
        suggestion, setSuggestion, messages, 
        realtimeInput, realtimeOutput, 
        sendTextMessage, updateContext, addMessage,
        agentMode, switchMode
    };
};
