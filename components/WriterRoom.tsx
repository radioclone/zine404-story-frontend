
import React, { useState, useEffect } from 'react';
import WindowFrame from './WindowFrame';
import { useLiveAgent, AgentMode } from '../hooks/useLiveAgent';
import { useSimulatedCollaboration } from '../hooks/useSimulatedCollaboration';
import { useSoundContext } from '../contexts/SoundContext';
import ChatSidebar from './ChatSidebar';
import SuggestionOverlay from './SuggestionOverlay';
import CollaboratorHeader from './CollaboratorHeader';

interface WriterRoomProps {
    onClose: () => void;
    initialTitle?: string;
    initialContent?: string;
}

const CAMPAIGN_BIBLE_TEMPLATE = `SERIES BIBLE: "THE ETHERSEA CHRONICLES"
----------------------------------------
FORMAT: Interactive Campaign (Season 1)
GENRE: Arcane Punk / Noir
TOKEN GATE: Guild_Ether_01

CORE CONCEPT:
A crew of magical debt collectors discovers a glitch in reality that threatens the blockchain of memories holding the city together.

THE PARTY (CAST):
- [PLAYER 1]: Valerius (The Face) - Sorcerer/Bard.
- [PLAYER 2]: Brix (The Muscle) - Warforged Barbarian.
- [PLAYER 3]: Echo (The Brains) - Divination Wizard.

SEASON ARC:
- Episode 1: The Job (Heist goes wrong).
- Episode 2: The Glitch (Discovery of the artifact).
- Mid-Season Finale: The Guild turns on them.

SCENE 1: THE DOCKS (Action Beat)
--------------------------------
SETTING: Midnight. Rain slicks the neon-lit cobblestones.
MECHANICS: Stealth Check (DC 15).

[GM/DIRECTOR]: The camera PANS DOWN from the towering spires to the grimy docks. Brix, you're hiding behind a crate of illicit mana-crystals. What do you do?

BRIX
I signal to Valerius. "Coast is clear."
(Rolls Stealth: 18)
`;

const WriterRoom: React.FC<WriterRoomProps> = ({ 
    onClose, 
    initialTitle = "Campaign_Bible_S01", 
    initialContent = CAMPAIGN_BIBLE_TEMPLATE 
}) => {
    const [content, setContent] = useState(initialContent);
    const [lastSyncedContent, setLastSyncedContent] = useState(initialContent);
    const [isSyncing, setIsSyncing] = useState(false);
    const [permaSaving, setPermaSaving] = useState(false);
    const [selectedText, setSelectedText] = useState("");

    // --- HOOKS ---
    const { 
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
        addMessage,
        agentMode,
        switchMode
    } = useLiveAgent();

    // Pass addMessage to collaboration hook
    const { collaborators } = useSimulatedCollaboration(setContent, addMessage);
    
    const { toggleFocusMusic } = useSoundContext();
    const [isFocusOn, setIsFocusOn] = useState(false);

    // Debounced Context Sync (Content & Selection)
    useEffect(() => {
        if (!isConnected) return;
        
        // Sync content changes
        if (content !== lastSyncedContent) {
            const timer = setTimeout(() => {
                setIsSyncing(true);
                updateContext(content);
                setLastSyncedContent(content);
                setTimeout(() => setIsSyncing(false), 1500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [content, isConnected, lastSyncedContent, updateContext]);

    // Handle Selection Sync immediately (for quick questions)
    useEffect(() => {
        if (!isConnected || !selectedText) return;
        updateContext(content, selectedText);
    }, [selectedText]);

    // Auto-cleanup on close
    useEffect(() => {
        return () => {
            disconnect();
            toggleFocusMusic(false);
        };
    }, []);

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

    const handlePermaSave = () => {
        setPermaSaving(true);
        setTimeout(() => {
            setPermaSaving(false);
            alert("Season Arc minted to Story Protocol.\nAssets distributed to Guild Wallets.\nTX: 0x...odyssey");
        }, 2000);
    };

    const handleSelectionChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const sel = target.value.substring(target.selectionStart, target.selectionEnd);
        if (sel !== selectedText) {
            setSelectedText(sel);
        }
    };

    const handleAnalyzeSelection = () => {
        if (!selectedText || !isConnected) return;
        // Updated prompt to focus on Cinematic/RPG analysis
        sendTextMessage(`[DIRECTOR REQUEST] Analyze this scene. 1. Is the RPG mechanic (DC/Roll) fair? 2. Visualize this as a Netflix shot (Lighting/Camera). Use 'visualize_scene' tool.`);
    };

    return (
        <WindowFrame title="Writer's Room // Campaign Mode" onClose={onClose}>
            <div className="flex w-full h-full relative overflow-hidden">
                
                {/* --- MAIN EDITOR --- */}
                <div className={`flex-1 flex flex-col p-8 bg-transparent relative transition-all duration-1000 ease-in-out ${isFocusOn ? 'scale-[1.02]' : ''}`}>
                    
                    {/* Header Controls - Fade out in Focus Mode */}
                    <div className={`flex items-center justify-between mb-6 transition-all duration-700 ${isFocusOn ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3">
                                 <div className="w-2 h-8 bg-[#F7931A]" />
                                 <h2 className="text-2xl font-bold text-white/90">{initialTitle}</h2>
                                 {isSyncing && (
                                    <span className="text-[10px] font-mono text-[#F7931A] animate-pulse ml-2 px-2 py-1 rounded bg-[#F7931A]/10 border border-[#F7931A]/20">
                                        UPLOADING TO GUILD...
                                    </span>
                                 )}
                             </div>
                             <CollaboratorHeader collaborators={collaborators} />
                        </div>

                        {/* MODE SELECTOR */}
                        {isConnected && (
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                {(['GAME_MASTER', 'DIRECTOR', 'EDITOR'] as AgentMode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => switchMode(m)}
                                        className={`px-3 py-1.5 text-[10px] font-bold font-mono rounded-md transition-all ${agentMode === m ? 'bg-[#F7931A] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {m.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-4 items-center">
                            {/* Analyze Selection Button (Visible when text selected & AI connected) */}
                            {selectedText && isConnected && (
                                <button 
                                    onClick={handleAnalyzeSelection}
                                    className="px-4 py-2 rounded-full border border-[#F7931A] text-[#F7931A] bg-[#F7931A]/10 text-sm font-mono flex items-center gap-2 transition-all hover:bg-[#F7931A]/20 animate-scale-in"
                                >
                                    <span>🎥</span> VISUALIZE
                                </button>
                            )}

                            <button 
                                onClick={handlePermaSave}
                                disabled={permaSaving}
                                className={`px-4 py-2 rounded-full border text-sm font-mono flex items-center gap-2 transition-all ${permaSaving ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41]' : 'border-white/20 text-white/50 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span className={permaSaving ? "animate-spin" : ""}>⟳</span> 
                                {permaSaving ? 'MINTING SEASON...' : 'MINT SEASON'}
                            </button>
                            <button 
                                onClick={handleFocusToggle}
                                className={`px-4 py-2 rounded-full border text-sm font-mono flex items-center gap-2 transition-all ${isFocusOn ? 'bg-[#F7931A]/20 border-[#F7931A] text-[#F7931A]' : 'border-white/20 text-white/50 hover:bg-white/10'}`}
                            >
                                <span className={isFocusOn ? "animate-pulse" : ""}>●</span> CINEMA MODE
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative flex-1 flex flex-col">
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onSelect={handleSelectionChange}
                            className={`
                                flex-1 rounded-xl p-8 text-lg font-mono leading-relaxed resize-none outline-none 
                                transition-all duration-500 ease-out
                                custom-scrollbar relative z-10 
                                selection:bg-[#F7931A]/40
                                
                                ${isFocusOn 
                                    ? 'bg-black/40 text-white/90 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]' 
                                    : 'bg-white/[0.02] text-white/60 border-white/[0.05] hover:bg-white/[0.04] focus:bg-white/[0.06] focus:text-white/90 focus:border-white/20 focus:shadow-[0_0_30px_rgba(255,255,255,0.05)] focus:scale-[1.005]'
                                }
                            `}
                            placeholder="Describe your scene or roll for initiative..."
                        />
                        
                        {/* Typing Indicator Overlay */}
                         {collaborators.some(c => c.status === 'TYPING') && (
                            <div className="absolute bottom-10 right-10 z-20 pointer-events-none flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 animate-fade-in-up">
                                <div className="flex -space-x-1">
                                    {collaborators.filter(c => c.status === 'TYPING').map(c => (
                                        <div key={c.id} className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: c.color }} />
                                    ))}
                                </div>
                                <span className="text-[10px] text-white/60 font-mono">Guild active...</span>
                            </div>
                         )}

                        {/* --- AI SUGGESTION OVERLAY --- */}
                        {suggestion && (
                             <SuggestionOverlay 
                                suggestion={suggestion}
                                onAccept={handleAcceptSuggestion}
                                onDiscard={() => setSuggestion(null)}
                             />
                         )}
                    </div>
                </div>

                {/* --- CHAT SIDEBAR --- */}
                {/* Dims and blurs in Focus Mode */}
                <div className={`
                    border-l border-white/5 h-full transition-all duration-1000 ease-in-out
                    ${isFocusOn ? 'w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'}
                `}>
                     <div className="w-80 h-full">
                        <ChatSidebar 
                            isConnected={isConnected}
                            connect={() => connect(content)}
                            disconnect={disconnect}
                            messages={messages}
                            realtimeInput={realtimeInput}
                            realtimeOutput={realtimeOutput}
                            onSendMessage={sendTextMessage}
                            isSpeaking={isSpeaking}
                            volume={volume}
                        />
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default WriterRoom;
