import React, { useState, useRef, useEffect } from 'react';
import WindowFrame from './WindowFrame';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { useSimulatedCollaboration } from '../hooks/useSimulatedCollaboration';
import { useSoundContext } from '../contexts/SoundContext';

interface WriterRoomProps {
    onClose: () => void;
    initialTitle?: string;
    initialContent?: string;
}

const DEFAULT_CONTENT = `PROJECT IDEA: "The Neon Samurai"
--------------------------------

Logline: A ronin in 2140 Tokyo seeks redemption by protecting an AI child from the Yakuza.

Characters:
- Kenji (The Ronin)
- Aiko (The AI)

Notes:
- Need to commission concept art.
- Exploring different licensing models for fan fiction.`;

const WriterRoom: React.FC<WriterRoomProps> = ({ 
    onClose, 
    initialTitle = "Draft_01", 
    initialContent = DEFAULT_CONTENT 
}) => {
    const [content, setContent] = useState(initialContent);
    const [lastSyncedContent, setLastSyncedContent] = useState(initialContent);
    const [isSyncing, setIsSyncing] = useState(false);

    const [chatInput, setChatInput] = useState("");
    
    // --- HOOKS ---
    const { 
        connect, 
        disconnect, 
        isConnected, 
        isSpeaking, 
        suggestion, 
        setSuggestion,
        messages,
        realtimeInput,
        realtimeOutput,
        sendTextMessage,
        updateContext
    } = useLiveAgent();

    const { collaborators } = useSimulatedCollaboration(setContent);
    
    const { toggleFocusMusic } = useSoundContext();
    const [isFocusOn, setIsFocusOn] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Debounced Context Sync
    useEffect(() => {
        if (!isConnected) return;
        if (content === lastSyncedContent) return;

        const timer = setTimeout(() => {
            setIsSyncing(true);
            updateContext(content);
            setLastSyncedContent(content);
            setTimeout(() => setIsSyncing(false), 1500); // Visual delay
        }, 3000); // Sync after 3 seconds of inactivity

        return () => clearTimeout(timer);
    }, [content, isConnected, lastSyncedContent, updateContext]);

    // Auto-cleanup on close
    useEffect(() => {
        return () => {
            disconnect();
            toggleFocusMusic(false);
        };
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, realtimeInput, realtimeOutput]);

    const handleFocusToggle = () => {
        const newState = !isFocusOn;
        setIsFocusOn(newState);
        toggleFocusMusic(newState);
    };

    const handleAcceptSuggestion = () => {
        if (suggestion) {
            setContent(prev => prev + "\n\n" + suggestion.text);
            setSuggestion(null);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendTextMessage(chatInput);
            setChatInput("");
        }
    };

    return (
        <WindowFrame title="Writer's Room" onClose={onClose}>
            <div className="flex w-full h-full relative">
                {/* --- MAIN EDITOR --- */}
                <div className="flex-1 flex flex-col p-8 bg-transparent relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3">
                                 <div className="w-2 h-8 bg-[#F7931A]" />
                                 <h2 className="text-2xl font-bold text-white/90">{initialTitle}</h2>
                                 {isSyncing && (
                                    <span className="text-[10px] font-mono text-[#F7931A] animate-pulse ml-2 px-2 py-1 rounded bg-[#F7931A]/10 border border-[#F7931A]/20">
                                        READING_CHANGES...
                                    </span>
                                 )}
                             </div>

                             {/* COLLABORATORS UI */}
                             <div className="flex -space-x-2 items-center">
                                {collaborators.map(c => (
                                    <div key={c.id} className="relative group cursor-pointer">
                                        <div 
                                            className={`
                                                w-8 h-8 rounded-full border-2 border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-black
                                                transition-all duration-300
                                                ${c.status === 'TYPING' ? 'animate-bounce' : ''}
                                            `}
                                            style={{ backgroundColor: c.color }}
                                        >
                                            {c.initials}
                                        </div>
                                        {/* Status Dot */}
                                        <div className={`
                                            absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1c1c1e]
                                            ${c.status === 'TYPING' ? 'bg-green-400' : 'bg-green-800'}
                                        `}/>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                            {c.name} {c.status === 'TYPING' && '(Typing...)'}
                                        </div>
                                    </div>
                                ))}
                                {collaborators.length > 0 && (
                                    <div className="ml-4 text-xs font-mono text-white/30">
                                        {collaborators.length} ONLINE
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleFocusToggle}
                                className={`px-4 py-2 rounded-full border text-sm font-mono flex items-center gap-2 transition-all ${isFocusOn ? 'bg-[#F7931A]/20 border-[#F7931A] text-[#F7931A]' : 'border-white/20 text-white/50 hover:bg-white/10'}`}
                            >
                                <span className={isFocusOn ? "animate-pulse" : ""}>●</span> FOCUS_AUDIO
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 flex flex-col">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 bg-black/20 rounded-xl p-8 text-lg font-mono leading-relaxed text-white/80 resize-none outline-none border border-white/5 focus:border-white/20 transition-all shadow-inner custom-scrollbar"
                            placeholder="Start typing your story..."
                        />

                        {/* --- AI SUGGESTION OVERLAY --- */}
                        {suggestion && (
                             <div className="absolute bottom-6 left-6 right-6 bg-[#1c1c1e] border border-[#F7931A] p-6 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-scale-in z-20">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#F7931A] rounded-full animate-pulse"/>
                                        <h4 className="text-[#F7931A] font-mono font-bold text-sm tracking-widest">MUZE SUGGESTION</h4>
                                     </div>
                                     <button onClick={() => setSuggestion(null)} className="text-white/40 hover:text-white transition-colors">✕</button>
                                 </div>
                                 
                                 <p className="text-xs text-white/60 mb-3 font-mono border-b border-white/10 pb-3 leading-relaxed">
                                    <span className="text-[#F7931A]/80 font-bold">RATIONALE:</span> {suggestion.rationale}
                                 </p>
                                 
                                 <div className="bg-black/40 p-4 rounded-lg text-white/90 font-mono text-sm mb-4 border-l-2 border-[#F7931A] whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                                     {suggestion.text}
                                 </div>
                                 
                                 <div className="flex gap-3">
                                     <button 
                                        onClick={handleAcceptSuggestion} 
                                        className="bg-[#F7931A] text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#ffad42] transition-colors shadow-lg"
                                     >
                                         Accept & Append
                                     </button>
                                     <button 
                                        onClick={() => setSuggestion(null)} 
                                        className="bg-white/10 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors"
                                     >
                                         Discard
                                     </button>
                                 </div>
                             </div>
                         )}
                    </div>
                </div>

                {/* --- AI MUSE CHAT SIDEBAR --- */}
                <div className="w-80 border-l border-white/10 bg-white/[0.02] flex flex-col relative">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-white/70 tracking-widest text-xs uppercase mb-1">MUZE</h3>
                            <p className="text-xs text-white/30">Gemini Live Assistant</p>
                        </div>
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                            ${isConnected ? 'bg-[#F7931A]/10 border border-[#F7931A]' : 'bg-white/5 border border-white/10'}
                        `}>
                            {isConnected && <div className="w-2 h-2 rounded-full bg-[#F7931A] animate-pulse" />}
                        </div>
                    </div>

                    {!isConnected ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6">
                             <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                 <span className="text-4xl opacity-20">✦</span>
                             </div>
                             <p className="text-sm text-white/50 leading-relaxed">
                                Connect to start a voice and text session with your AI creative guide.
                             </p>
                             <button 
                                onClick={() => connect(content)}
                                className="w-full py-4 rounded-xl font-bold tracking-wide transition-all bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                CALL MUZE
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                                {messages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div 
                                            className={`
                                                max-w-[90%] p-3 rounded-2xl text-xs font-mono leading-relaxed relative
                                                ${msg.role === 'user' 
                                                    ? 'bg-white/10 text-white rounded-br-none' 
                                                    : msg.role === 'system' 
                                                        ? 'bg-transparent border border-white/10 text-white/50 w-full text-center italic'
                                                        : 'bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A] rounded-bl-none'
                                                }
                                            `}
                                        >
                                            {/* Special Visual for Dice Rolls */}
                                            {msg.role === 'system' && msg.data?.result ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-lg">🎲</span>
                                                    <span className="font-bold text-white text-sm">{msg.data.result}</span>
                                                    <span className="text-[10px] uppercase">{msg.data.reason}</span>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Realtime Transcription Bubbles */}
                                {realtimeInput && (
                                     <div className="flex flex-col items-end opacity-60">
                                         <div className="max-w-[90%] p-3 rounded-2xl text-xs font-mono leading-relaxed bg-white/5 text-white/70 rounded-br-none border border-white/10 border-dashed">
                                             {realtimeInput} <span className="animate-pulse">_</span>
                                         </div>
                                     </div>
                                )}
                                {realtimeOutput && (
                                     <div className="flex flex-col items-start opacity-60">
                                         <div className="max-w-[90%] p-3 rounded-2xl text-xs font-mono leading-relaxed bg-[#F7931A]/5 border border-[#F7931A]/20 text-[#F7931A]/70 rounded-bl-none border-dashed">
                                             {realtimeOutput} <span className="animate-pulse">_</span>
                                         </div>
                                     </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input & Controls */}
                            <div className="p-4 border-t border-white/5 bg-black/20">
                                <form onSubmit={handleSendMessage} className="relative mb-3">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Message Muze..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#F7931A]/50 transition-colors font-mono"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F7931A] disabled:opacity-30 transition-colors"
                                    >
                                        ➤
                                    </button>
                                </form>
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[#F7931A] animate-ping' : 'bg-white/20'}`} />
                                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">
                                            {isSpeaking ? 'VOICE ACTIVE' : 'MIC READY'}
                                        </span>
                                     </div>
                                     <button 
                                        onClick={disconnect}
                                        className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-wider border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                    >
                                        END SESSION
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </WindowFrame>
    );
};

export default WriterRoom;