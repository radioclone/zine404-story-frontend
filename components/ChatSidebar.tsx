
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../hooks/useLiveAgent';

interface ChatSidebarProps {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    messages: ChatMessage[];
    realtimeInput: string;
    realtimeOutput: string;
    onSendMessage: (text: string) => void;
    isSpeaking: boolean;
    volume?: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    isConnected,
    connect,
    disconnect,
    messages,
    realtimeInput,
    realtimeOutput,
    onSendMessage,
    isSpeaking,
    volume = 0
}) => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, realtimeInput, realtimeOutput]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput("");
        }
    };

    return (
        <div className="w-80 border-l border-white/10 bg-white/[0.02] flex flex-col relative h-full">
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
                        onClick={connect}
                        className="w-full py-4 rounded-xl font-bold tracking-wide transition-all bg-white text-black hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        CALL MUZE
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                {msg.role === 'collaborator' && (
                                    <span className="text-[10px] text-white/40 mb-1 ml-1" style={{ color: msg.color }}>
                                        {msg.author}
                                    </span>
                                )}
                                
                                <div 
                                    className={`
                                        max-w-[90%] p-3 rounded-2xl text-xs font-mono leading-relaxed relative
                                        ${msg.role === 'user' 
                                            ? 'bg-white/10 text-white rounded-br-none' 
                                            : msg.role === 'system' 
                                                ? 'bg-transparent border border-white/10 text-white/50 w-full text-center italic'
                                                : msg.role === 'collaborator'
                                                    ? 'bg-white/5 border border-l-2 text-white/80 rounded-bl-none'
                                                    : 'bg-[#F7931A]/10 border border-[#F7931A]/30 text-[#F7931A] rounded-bl-none'
                                        }
                                    `}
                                    style={msg.role === 'collaborator' ? { borderLeftColor: msg.color || 'white' } : {}}
                                >
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

                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <form onSubmit={handleSubmit} className="relative mb-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message Muze..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#F7931A]/50 transition-colors font-mono"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F7931A] disabled:opacity-30 transition-colors"
                            >
                                ➤
                            </button>
                        </form>
                        <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full transition-all duration-75 ${isSpeaking ? 'bg-[#F7931A] animate-ping' : volume > 0.05 ? 'bg-green-400 scale-125' : 'bg-white/20'}`} />
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${isSpeaking ? 'text-[#F7931A]' : volume > 0.05 ? 'text-green-400' : 'text-white/30'}`}>
                                        {isSpeaking ? 'MUZE SPEAKING' : volume > 0.05 ? 'LISTENING...' : 'MIC READY'}
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
    );
};

export default ChatSidebar;
