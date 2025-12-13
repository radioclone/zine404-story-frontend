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
        // Mobile: Icons are ~80px wide.
        // Tablet: Icons are ~110px wide.
        // Desktop: Icons are ~192px wide (w-48).
        
        const colStride = isMobile ? 100 : (isTablet ? 180 : 240);
        const rowStride = isMobile ? 120 : (isTablet ? 180 : 240);
        const startX = isMobile ? 20 : 60;
        const startY = 120;

        // Trash Position Calculation
        // Icon Height (approx): 200px (Desktop), 150px (Mobile)
        // Icon Width: 192px (Desktop), 80px (Mobile)
        // We need enough margin from bottom/right
        const trashX = w - (isMobile ? 100 : 250);
        const trashY = h - (isMobile ? 160 : 250);

        return [
            { id: 'node', label: 'Story Network', x: startX, y: startY, type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', x: startX, y: startY + rowStride, type: 'APP' },
            
            { id: 'manifesto', label: 'Manifesto.txt', x: startX + colStride, y: startY, type: 'FILE' },
            { id: 'draft', label: 'My_Idea_v1.txt', x: startX + colStride, y: startY + rowStride, type: 'FILE' },
            
            { id: 'music', label: 'Rcade', x: startX + (colStride * 2), y: startY, type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'timer', label: 'Sprint', x: startX + (colStride * 2), y: startY + rowStride, type: 'TIMER' },
            
            { id: 'shopping', label: 'Shopping', x: startX + (colStride * 3), y: startY, type: 'SHOPPING', url: 'https://ip.world/' },
            { id: 'kb', label: 'Dojo', x: startX + (colStride * 3), y: startY + rowStride, type: 'BOOK' },
            
            // Trash anchored to bottom right with sufficient padding
            { id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' }, 
        ];
    };

    const [icons, setIcons] = useState<IconData[]>(getInitialIcons());

    // Handle Resize to keep Trash in corner
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
            setOpenDocId('draft'); // This will now open the WriterRoom
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
            {/* Cleaner, simpler shell without video/phaser props */}
            <SpatialShell>
                <div/>
            </SpatialShell>

            <MenuBar />

            {/* --- DESKTOP LAYER --- */}
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
                                {/* Inner Ring Glow */}
                                <div className="absolute inset-1 rounded-full border border-white/10 opacity-50 group-hover:border-white/30 transition-colors" />

                                {/* Top Highlight (Glass effect) */}
                                <div className="absolute top-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60" />
                                
                                {/* Text with slight text-shadow for depth */}
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
            
            {/* --- TIMER WIDGET (Always on top when active) --- */}
            {showTimer && <TimerWidget onClose={() => setShowTimer(false)} />}

            {/* --- DOC VIEWER / WRITER ROOM --- */}
            {/* Render if either draft or manifesto is open */}
            {(openDocId === 'draft' || openDocId === 'manifesto') && (
                <WriterRoom 
                    onClose={() => setOpenDocId(null)}
                    initialTitle={openDocId === 'manifesto' ? 'Manifesto.txt' : 'My_Idea_v1.txt'}
                    initialContent={openDocId === 'manifesto' 
                        ? "MANIFESTO: STORY OS\n\nSharing the great interface design work of Jaime Levy.\n\nIt's very inspiring artwork for a young kid using Mac HyperCards."
                        : undefined // Will use default
                    }
                />
            )}
            
            {/* --- KNOWLEDGE BASE --- */}
            {showKnowledgeBase && (
                <KnowledgeBase onClose={() => setShowKnowledgeBase(false)} />
            )}

            {/* --- IP LAUNCHER APP --- */}
            {viewMode === 'LAUNCHER' && (
                <IpLauncher onClose={() => setViewMode('DESKTOP')} />
            )}
            
            {/* --- ELEVENLABS AGENT --- */}
            {/* @ts-ignore */}
            <elevenlabs-convai agent-id="agent_1901kcbdf52ses1s50nght71142d"></elevenlabs-convai>
        </div>
    );
};

export default App;