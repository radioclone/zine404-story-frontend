import React, { useState, useEffect } from 'react';
import SpatialShell from './components/SpatialShell';
import MenuBar from './components/MenuBar';
import DraggableIcon from './components/DraggableIcon';
import WriterRoom from './components/WriterRoom';
import TimerWidget from './components/TimerWidget';
import IpLauncher from './components/IpLauncher';
import KnowledgeBase from './components/KnowledgeBase';
import { useSoundContext } from './contexts/SoundContext';
import { useWalletContext } from './contexts/WalletContext';
import { IconData } from './types';

const IDEA_STATE_TEMPLATE = `IDEA STATE: [UNTITLED]
-----------------------
GENRE: Cyberpunk / Noir / Fantasy
TONE: Gritty, High-Stakes

WORLD LOGIC:
1. Technology is organic.
2. Currency is memory.

CHARACTERS:
- [HERO]: A memory dealer running from the debt collectors.
- [VILLAIN]: An AI construct trying to digitize the physical world.

INCITING INCIDENT:
The Hero finds a memory chip that doesn't belong to any human.`;

const MANIFESTO_TEXT = `MANIFESTO: STORY OS

A narrative operating system for collaborative storytelling.

1. DEFINE: Create an "Idea State" (World, Logic, Characters).
2. SIMULATE: Run branching scenes with AI or peers (D&D-style).
3. COLLECT: Save dialogues as reusable assets.
4. OWN: Register everything on Story Protocol.`;

const App: React.FC = () => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState<'DESKTOP' | 'LAUNCHER'>('DESKTOP');
    const [openDocId, setOpenDocId] = useState<string | null>(null);
    const [showTimer, setShowTimer] = useState(false);
    const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
    
    // --- GLOBAL CONTEXTS ---
    const { playClick, playIgnition, playHover } = useSoundContext();
    const { connect, address: walletAddress } = useWalletContext();

    // Responsive Grid Initializer
    const getInitialIcons = (): IconData[] => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w < 768;
        const isTablet = w >= 768 && w < 1024;
        
        // Adjust grid strides based on icon size
        const colStride = isMobile ? 100 : (isTablet ? 180 : 240);
        const rowStride = isMobile ? 120 : (isTablet ? 180 : 240);
        const startX = isMobile ? 20 : 60;
        const startY = 120;

        const trashX = w - (isMobile ? 100 : 250);
        const trashY = h - (isMobile ? 160 : 250);

        return [
            { id: 'node', label: 'Story Network', x: startX, y: startY, type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', x: startX, y: startY + rowStride, type: 'APP' },
            
            { id: 'manifesto', label: 'Manifesto.txt', x: startX + colStride, y: startY, type: 'FILE' },
            { id: 'draft', label: 'Idea_State_v1.txt', x: startX + colStride, y: startY + rowStride, type: 'FILE' },
            
            { id: 'music', label: 'Rcade', x: startX + (colStride * 2), y: startY, type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'timer', label: 'Sprint', x: startX + (colStride * 2), y: startY + rowStride, type: 'TIMER' },
            
            { id: 'shopping', label: 'Shopping', x: startX + (colStride * 3), y: startY, type: 'SHOPPING', url: 'https://ip.world/' },
            { id: 'kb', label: 'Dojo', x: startX + (colStride * 3), y: startY + rowStride, type: 'BOOK' },
            
            { id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' }, 
        ];
    };

    const [icons, setIcons] = useState<IconData[]>(getInitialIcons());

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 768;
            
            const trashX = w - (isMobile ? 100 : 250);
            const trashY = h - (isMobile ? 160 : 250);

            setIcons(prev => prev.map(icon => 
                icon.id === 'trash' 
                    ? { ...icon, x: trashX, y: trashY } 
                    : icon
            ));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleConnectWallet = async () => {
        playClick();
        await connect();
        playIgnition(); 
    };

    const handleIconAction = async (id: string) => {
        const icon = icons.find(i => i.id === id);
        if (!icon) return;

        if (icon.url) {
            playClick();
            window.open(icon.url, '_blank');
            return;
        }

        if (icon.type === 'APP') {
            await playIgnition();
            setViewMode('LAUNCHER');
        } else if (icon.type === 'TRASH') {
            playClick();
            alert("Protocol Burn Mechanism: Trash is empty.");
        } else if (icon.id === 'manifesto') {
            playClick();
            setOpenDocId('manifesto');
        } else if (icon.id === 'draft') {
            playClick();
            setOpenDocId('draft'); 
        } else if (icon.type === 'NODE') {
            playClick();
            window.open('https://portal.story.foundation/', '_blank');
        } else if (icon.id === 'timer') {
            playClick();
            setShowTimer(prev => !prev);
        } else if (icon.id === 'kb') {
            playClick();
            setShowKnowledgeBase(true);
        } else {
            playClick();
        }
    };

    const updateIconPos = (id: string, x: number, y: number) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, x, y } : icon));
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white selection:bg-[#F7931A]/30">
            <SpatialShell>
                <div/>
            </SpatialShell>

            <MenuBar />

            <div className={`absolute inset-0 z-10 transition-all duration-700 pt-10 ${viewMode === 'LAUNCHER' || openDocId || showKnowledgeBase ? 'scale-105 blur-[8px] opacity-30 pointer-events-none' : 'scale-100 opacity-100'}`}>
                {icons.map(icon => (
                    <DraggableIcon 
                        key={icon.id} 
                        iconData={icon} 
                        onUpdatePos={updateIconPos}
                        onAction={handleIconAction}
                        onDragEnd={() => {}}
                        onHover={() => playHover()}
                    />
                ))}

                {!walletAddress && (
                    <div className="absolute bottom-40 left-0 right-0 flex justify-center z-30 pointer-events-none">
                        <div className="pointer-events-auto animate-float">
                            <div 
                                onClick={handleConnectWallet}
                                className="
                                    group relative cursor-pointer
                                    w-[320px] md:w-[420px] h-[70px] md:h-[80px] rounded-full
                                    bg-white/[0.03] backdrop-blur-[20px]
                                    border border-white/20
                                    shadow-[0_20px_60px_rgba(0,0,0,0.4),_0_0_0_1px_rgba(255,255,255,0.1)]
                                    flex items-center justify-center
                                    overflow-hidden transition-all duration-500
                                    hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/40 hover:shadow-[0_0_80px_rgba(255,255,255,0.2)]
                                "
                            >
                                <div className="absolute inset-1 rounded-full border border-white/10 opacity-50 group-hover:border-white/30 transition-colors" />
                                <div className="absolute top-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60" />
                                <span className="
                                    relative z-10 font-mono tracking-[0.3em] text-base md:text-lg uppercase text-white/90
                                    drop-shadow-[0_2px_10px_rgba(0,0,0,1)]
                                    group-hover:text-white group-hover:tracking-[0.35em] transition-all duration-500
                                ">
                                    SYNC PROTOCOL
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {showTimer && <TimerWidget onClose={() => setShowTimer(false)} />}

            {(openDocId === 'draft' || openDocId === 'manifesto') && (
                <WriterRoom 
                    onClose={() => setOpenDocId(null)}
                    initialTitle={openDocId === 'manifesto' ? 'Manifesto.txt' : 'Idea_State_v1.txt'}
                    initialContent={openDocId === 'manifesto' ? MANIFESTO_TEXT : IDEA_STATE_TEMPLATE}
                />
            )}
            
            {showKnowledgeBase && (
                <KnowledgeBase onClose={() => setShowKnowledgeBase(false)} />
            )}

            {viewMode === 'LAUNCHER' && (
                <IpLauncher onClose={() => setViewMode('DESKTOP')} />
            )}
            
            {/* @ts-ignore */}
            <elevenlabs-convai agent-id="agent_1901kcbdf52ses1s50nght71142d"></elevenlabs-convai>
        </div>
    );
};

export default App;