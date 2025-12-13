
import { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { useAudioStream } from './useAudioStream';

export type AgentMode = 'ARCHITECT' | 'GAME_MASTER' | 'EDITOR' | 'DIRECTOR';

export interface MuzeSuggestion {
    rationale: string;
    text: string;
    type?: 'DIALOGUE' | 'ACTION' | 'LORE' | 'PACING' | 'PLOT' | 'VISUAL';
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
    ARCHITECT: `MODE: ARCHITECT (World Builder).
    - Goal: Establish the "Series Bible" (Lore, Tone, Logic).
    - Behavior: Connect loose plot threads. Ensure the magic system makes sense.
    - Tone: Foundational, Abstract.`,
    
    GAME_MASTER: `MODE: GAME MASTER (Simulation).
    - Goal: Run the D&D session.
    - Behavior: Describe the scene. Ask for skill checks (d20). React to player agency.
    - Tone: Urgent, Sensory, Interactive.
    - Rules: Always ask "What do you do?" after a description.`,
    
    EDITOR: `MODE: EDITOR (Script Doctor).
    - Goal: Refine the dialogue and pacing for a reading audience.
    - Behavior: Suggest cuts. Fix dialogue flow.
    - Tone: Professional, Constructive.`,

    DIRECTOR: `MODE: DIRECTOR (Visualizer).
    - Goal: Translate text/gameplay into cinematic instructions for AI Video Generation.
    - Behavior: Analyze the scene. Describe camera angles, lighting (e.g., "neon-noir"), and FX.
    - Tool: Use 'visualize_scene' to create a prompt for the visual engine.
    - Tone: Visionary, Technical (Film terminology).`
};

export const useLiveAgent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [agentMode, setAgentMode] = useState<AgentMode>('GAME_MASTER');
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
                description: "Propose a concrete text addition or edit based on the user's selection or request.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['DIALOGUE', 'ACTION', 'LORE', 'PACING', 'PLOT', 'VISUAL'] },
                        rationale: { type: Type.STRING, description: "Why this edit improves the script (pacing, tone, consistency)." },
                        suggested_text: { type: Type.STRING, description: "The actual text to insert or replace." }
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

            const visualizeSceneTool: FunctionDeclaration = {
                name: "visualize_scene",
                description: "Generate a cinematic visual description (prompt) for the current scene.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        camera_angle: { type: Type.STRING, description: "e.g., Dutch Angle, Wide Shot, Close Up" },
                        lighting: { type: Type.STRING, description: "e.g., Neon Noir, Golden Hour, Harsh Shadows" },
                        sfx_cue: { type: Type.STRING, description: "Audio/Visual FX needed" },
                        visual_prompt: { type: Type.STRING, description: "The full midjourney/runway style prompt" }
                    },
                    required: ["camera_angle", "visual_prompt"]
                }
            };

            const config = {
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are MUZE, the Intelligent Showrunner of StoryOS.
                    
                    You are bridging the gap between Tabletop RPGs (D&D) and Streaming Series (Netflix).
                    Your job is to help the players (The Writers) turn their gameplay into a high-quality IP Asset.

                    CURRENT CONTEXT:
                    """
                    ${initialContent}
                    """

                    INITIAL BEHAVIOR:
                    ${SYSTEM_PROMPTS['GAME_MASTER']}

                    CORE RULES:
                    1. Keep responses under 15s unless narrating a scene intro.
                    2. Adapt instantly when Mode changes.
                    3. If the user asks for visuals, use the 'visualize_scene' tool.`,
                    tools: [{ functionDeclarations: [suggestEditTool, rollDiceTool, visualizeSceneTool] }]
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
                                    setSuggestion({ 
                                        rationale: args.rationale,
                                        text: args.suggested_text,
                                        type: args.type
                                    });
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
                                } else if (fc.name === 'visualize_scene') {
                                    const args = fc.args as any;
                                    setMessages(p => [...p, {
                                        id: Date.now().toString(), 
                                        role: 'system', 
                                        text: `🎬 VISUALIZING: ${args.camera_angle} | ${args.lighting}`, 
                                        data: { result: "SCENE_GENERATED", reason: "AI Video Prompt Ready" }
                                    }]);
                                    // In a real app, this would call an Image Gen API
                                    setSuggestion({
                                        type: 'VISUAL',
                                        rationale: `Cinematic visualization for ${args.lighting} scene.`,
                                        text: `[VISUAL CUE]: ${args.visual_prompt}\n[CAMERA]: ${args.camera_angle}\n[SFX]: ${args.sfx_cue || 'None'}`
                                    });
                                    sessionPromise.then(s => s.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result: "Visual prompt generated." } }
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
