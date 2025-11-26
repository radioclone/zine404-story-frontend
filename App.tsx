
import React, { useState, useEffect, useRef } from 'react';
import SpatialShell from './components/SpatialShell';
import AudioVisualizer from './components/AudioVisualizer';
import GlassPanel from './components/GlassPanel';
import { ViewState, DraftContent, SectionConfig, NetworkState, AgentMessage, IPLicenseParams } from './types';
import { useUiSounds } from './hooks/useUiSounds';
import { useAudioInput } from './hooks/useAudioInput';
import { consultAgent } from './services/geminiService';
import { useLiveAgent } from './hooks/useLiveAgent';

// --- [COMPONENT] TERMS CONFIGURATOR (PIL DECK) ---
const TermsSection = ({ draft, onUpdate }: { draft: DraftContent, onUpdate: (d: DraftContent) => void }) => {
    const updateTerms = (updates: Partial<IPLicenseParams>) => {
        onUpdate({
            ...draft,
            ip: {
                ...draft.ip,
                licenseTerms: { ...draft.ip.licenseTerms, ...updates }
            }
        });
    };

    const updateParent = (parentId: string) => {
         onUpdate({
            ...draft,
            ip: {
                ...draft.ip,
                parents: parentId ? [parentId] : []
            }
        });
    }

    return (
        <div className="max-w-3xl h-full flex flex-col gap-6">
            <div className="border-l-2 border-bitcoin-orange pl-6 mb-2 shrink-0">
                <h1 className="text-3xl font-bold text-white/90 leading-none mb-2">
                    LICENSE PARAMETERS
                </h1>
                <h2 className="text-xl font-light text-white/60">
                    PROGRAMMABLE IP LAYER
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto no-scrollbar pb-12">
                
                {/* PARENT IP (REMIX LOGIC) */}
                <div className="col-span-1 md:col-span-2 mb-2">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2 block">SOURCE IP (OPTIONAL REMIX)</span>
                    <input 
                        type="text" 
                        placeholder="0x... (PARENT ASSET ID)"
                        value={draft.ip.parents[0] || ''}
                        onChange={(e) => updateParent(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-bitcoin-orange font-mono text-xs focus:outline-none focus:border-bitcoin-orange/50 transition-colors"
                    />
                </div>

                {/* LICENSE TYPE SELECTOR */}
                <div className="col-span-1 md:col-span-2">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2 block">LICENSE PRESET</span>
                    <div className="grid grid-cols-3 gap-2">
                        {['NON_COMMERCIAL_REMIX', 'COMMERCIAL_USE', 'COMMERCIAL_REMIX'].map((type) => (
                            <button
                                key={type}
                                onClick={() => updateTerms({ type: type as any })}
                                className={`
                                    py-4 px-2 rounded-xl border font-mono text-[9px] tracking-wider transition-all
                                    ${draft.ip.licenseTerms.type === type 
                                        ? 'bg-bitcoin-orange/20 border-bitcoin-orange text-white' 
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}
                                `}
                            >
                                {type.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* COMMERCIAL REV SHARE */}
                <GlassPanel 
                    intensity="low" 
                    className={`p-6 transition-opacity ${draft.ip.licenseTerms.type.includes('COMMERCIAL') ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
                    active={draft.ip.licenseTerms.type.includes('COMMERCIAL')}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-mono text-[10px] tracking-widest text-white/60">REVENUE SHARE</span>
                        <span className="font-mono text-xl text-bitcoin-orange">{draft.ip.licenseTerms.commercialRevShare}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="50" step="5"
                        value={draft.ip.licenseTerms.commercialRevShare}
                        onChange={(e) => updateTerms({ commercialRevShare: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-bitcoin-orange"
                    />
                    <p className="font-serif text-white/40 text-xs mt-4">
                        Percentage of revenue automatically routed to you from derivative works.
                    </p>
                </GlassPanel>

                {/* DERIVATIVES TOGGLE */}
                <GlassPanel 
                    intensity="low" 
                    className="p-6 cursor-pointer group"
                    onClick={() => updateTerms({ derivativesAllowed: !draft.ip.licenseTerms.derivativesAllowed })}
                    active={draft.ip.licenseTerms.derivativesAllowed}
                    hoverEffect={true}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[10px] tracking-widest text-white/40">ALLOW DERIVATIVES</span>
                        <div className={`w-3 h-3 rounded-full border ${draft.ip.licenseTerms.derivativesAllowed ? 'bg-green-500 border-green-500' : 'bg-transparent border-white/20'}`} />
                    </div>
                    <p className="font-serif text-white/60 text-sm">
                        If enabled, other creators can remix this asset using the Story Protocol SDK.
                    </p>
                </GlassPanel>

                {/* METADATA PREVIEW */}
                 <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-black/40 border border-white/10 rounded-xl font-mono text-[10px] text-white/50 whitespace-pre-wrap">
                    {`// PIL TERMS PREVIEW\n{\n  "type": "${draft.ip.licenseTerms.type}",\n  "commercialRevShare": ${draft.ip.licenseTerms.commercialRevShare},\n  "derivativesAllowed": ${draft.ip.licenseTerms.derivativesAllowed},\n  "parents": [${draft.ip.parents.map(p => `"${p}"`).join(', ')}]\n}`}
                </div>
            </div>
        </div>
    );
};

// --- [COMPONENT] AGENT-EDITOR (FEED) ---
const EditorSection = ({ 
    draft, 
    onUpdate, 
    onRegister, 
    network,
    regStatus
}: { 
    draft: DraftContent, 
    onUpdate: (d: DraftContent) => void, 
    onRegister: () => void,
    network: NetworkState,
    regStatus: string
}) => {
    const [messages, setMessages] = useState<AgentMessage[]>([
        { id: '0', role: 'agent', content: 'SYSTEM ONLINE. INPUT CONTENT TO BEGIN IP INDEXING.' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- VOICE AGENT INTEGRATION ---
    const { connect, disconnect, isConnected, isSpeaking, volume } = useLiveAgent();

    const toggleVoice = async () => {
        if (isConnected) {
            disconnect();
        } else {
            await connect();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');

        // Update draft content dynamically if typing long text
        if (input.length > 10) {
             onUpdate({ ...draft, body: draft.body + '\n' + input });
        }

        const response = await consultAgent(newHistory, draft);
        setMessages(prev => [...prev, response]);

        // --- AI ACTION HANDLER ---
        if (response.data) {
            onUpdate({
                ...draft,
                ip: {
                    ...draft.ip,
                    licenseTerms: {
                        ...draft.ip.licenseTerms,
                        ...response.data // Merge suggested terms
                    }
                }
            });
        }
    };

    return (
        <div className="max-w-5xl h-full flex flex-col md:flex-row gap-6 pb-8">
            {/* LEFT: CHAT / AGENT INTERFACE */}
            <div className="flex-1 flex flex-col h-full min-h-0">
                 <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                    <div className="font-mono text-[10px] text-white/40 tracking-widest">LEGAL KERNEL // V.2.5</div>
                    
                    {/* VOICE TOGGLE */}
                    <button 
                        onClick={toggleVoice}
                        className={`
                            flex items-center gap-2 px-3 py-1 rounded-full border transition-all
                            ${isConnected ? 'bg-bitcoin-orange/10 border-bitcoin-orange text-bitcoin-orange' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}
                        `}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-bitcoin-orange animate-pulse' : 'bg-gray-500'}`} />
                        <span className="font-mono text-[8px] tracking-widest uppercase">
                            {isConnected ? (isSpeaking ? 'TRANSMITTING' : 'LISTENING') : 'VOICE UPLINK'}
                        </span>
                        {isConnected && (
                            <div className="flex gap-0.5 items-end h-2 ml-2">
                                <div className="w-0.5 bg-bitcoin-orange" style={{ height: `${Math.min(100, volume * 500)}%`, transition: 'height 0.1s' }} />
                                <div className="w-0.5 bg-bitcoin-orange" style={{ height: `${Math.min(100, volume * 300)}%`, transition: 'height 0.1s' }} />
                                <div className="w-0.5 bg-bitcoin-orange" style={{ height: `${Math.min(100, volume * 700)}%`, transition: 'height 0.1s' }} />
                            </div>
                        )}
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 no-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`
                                max-w-[85%] p-3 text-sm font-serif leading-relaxed
                                ${msg.role === 'user' 
                                    ? 'bg-white/10 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl border border-white/5' 
                                    : 'bg-bitcoin-orange/5 text-bitcoin-orange rounded-tr-xl rounded-br-xl rounded-bl-xl border border-bitcoin-orange/20'}
                            `}>
                                {msg.content}
                            </div>
                            
                            {msg.action === 'SUGGEST_TERMS' && (
                                <div className="mt-1 text-[8px] font-mono text-green-500 tracking-widest uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                                    LICENSE PARAMS UPDATED
                                </div>
                            )}

                            {msg.action === 'READY_TO_MINT' && (
                                <button 
                                    onClick={onRegister}
                                    className="mt-3 w-full py-2 bg-bitcoin-orange text-black font-mono text-[10px] tracking-widest uppercase hover:bg-white transition-colors rounded-lg"
                                >
                                    PROCEED TO REGISTRATION
                                </button>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>
                 
                 <div className="relative shrink-0">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message Agent..."
                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-bitcoin-orange/50 transition-colors"
                    />
                 </div>
            </div>

            {/* RIGHT: LIVE STATUS */}
            <div className="w-full md:w-80 border-l border-white/10 pl-6 flex flex-col hidden md:flex shrink-0">
                <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-4">ASSET BUFFER</div>
                <div className="flex-1 bg-white/5 rounded-xl p-4 overflow-y-auto font-serif text-white/60 text-sm whitespace-pre-wrap no-scrollbar border border-white/5 mb-4">
                    {draft.body || "Buffer Empty..."}
                </div>
                
                <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-white/40">NETWORK</span>
                        <span className={`font-mono text-[9px] ${network.isConnected ? 'text-green-500' : 'text-red-500'}`}>
                            {network.isConnected ? 'ODYSSEY TESTNET' : 'DISCONNECTED'}
                        </span>
                    </div>
                    
                    {/* REGISTRATION STATUS LOG */}
                    <div className="h-16 bg-black border border-white/10 p-2 font-mono text-[9px] text-bitcoin-orange overflow-hidden">
                        {regStatus || "> WAITING FOR INPUT..."}
                    </div>

                    <button 
                        onClick={onRegister}
                        disabled={draft.ip.status === 'REGISTERED'}
                        className={`w-full py-3 font-mono text-[10px] uppercase tracking-widest border transition-all
                            ${draft.ip.status === 'REGISTERED'
                                ? 'border-green-500 text-green-500 bg-green-500/10'
                                : 'border-white/20 text-white hover:bg-white hover:text-black'
                            }
                        `}
                    >
                        {draft.ip.status === 'REGISTERED' ? 'ASSET SECURED' : 'REGISTER ON-CHAIN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- [COMPONENT] MEDIA (SESSION) ---
const MediaSection = ({ 
    draft,
    onUpdate,
    isListening, 
    startListening, 
    analyser 
}: { 
    draft: DraftContent,
    onUpdate: (d: DraftContent) => void,
    isListening: boolean, 
    startListening: () => void, 
    analyser: any 
}) => {

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            // Simulate Hashing
            const mockHash = "0x" + Math.random().toString(16).substr(2, 40);
            onUpdate({
                ...draft,
                media: {
                    file: file,
                    previewUrl: url,
                    hash: mockHash,
                    mimeType: file.type
                }
            });
        }
    };

    return (
      <div className="flex flex-col h-full max-w-3xl gap-6">
          <div className="border-l-2 border-white/20 pl-6 mb-2 shrink-0">
                <h1 className="text-3xl font-bold text-white/90 leading-none mb-2">SESSION DATA</h1>
                <h2 className="text-xl font-light text-white/60">AUDIO / VISUAL</h2>
          </div>

          <div className="p-1 border border-white/10 bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden shrink-0">
              <AudioVisualizer isListening={isListening} startListening={startListening} analyser={analyser} />
          </div>
          
          <div 
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex-1 min-h-[200px]"
          >
            <GlassPanel intensity="low" className="w-full h-full flex items-center justify-center border-dashed border-white/20 cursor-pointer hover:border-bitcoin-orange/50 transition-colors group">
                {draft.media.previewUrl ? (
                    <div className="relative w-full h-full p-4">
                        {draft.media.file?.type.startsWith('image') ? (
                            <img src={draft.media.previewUrl} alt="Preview" className="w-full h-full object-contain opacity-80" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/60 font-mono">
                                <span className="text-2xl mb-2">AUDIO FILE</span>
                                <span className="text-xs border border-white/20 px-2 py-1 rounded">{draft.media.file?.name}</span>
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-black/90 px-3 py-2 rounded-lg text-[10px] font-mono text-green-500 border border-green-500/30 shadow-xl">
                            <div className="text-white/30 text-[8px] uppercase mb-1">IPFS CANDIDATE</div>
                            HASH: {draft.media.hash?.substr(0, 12)}...
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <span className="font-mono text-xs text-white/30 tracking-widest block mb-2 group-hover:text-bitcoin-orange transition-colors">DRAG & DROP ASSET</span>
                        <span className="font-mono text-[9px] text-white/20">SUPPORTS WAV, MP3, PNG, JPG, PDF</span>
                    </div>
                )}
            </GlassPanel>
          </div>
      </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('HOME');
  const [isIgnited, setIsIgnited] = useState(false);
  const [regStatus, setRegStatus] = useState('');
  
  const [draft, setDraft] = useState<DraftContent>({
      title: '',
      body: '',
      author: 'YOU',
      media: { file: null, previewUrl: null, hash: null, mimeType: null },
      ip: {
          id: null,
          status: 'UNREGISTERED',
          owner: '0x...',
          hash: '',
          licenseTerms: { 
              type: 'NON_COMMERCIAL_REMIX', 
              commercialRevShare: 0, 
              derivativesAllowed: true, 
              attribution: true 
          },
          parents: []
      }
  });

  const [network, setNetwork] = useState<NetworkState>({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false
  });

  const { playHover, playClick, playIgnition } = useUiSounds();
  const { isListening, startListening, analyserRef } = useAudioInput();
  const titleRef = useRef<HTMLDivElement>(null);

  const SECTIONS: SectionConfig[] = [
    { id: 'DRAFT', label: 'FEED', subLabel: 'AGENT' },
    { id: 'MEDIA', label: 'SESSION', subLabel: 'MEDIA' },
    { id: 'TERMS', label: 'INFO', subLabel: 'TERMS' },
  ];

  useEffect(() => {
    const handleAudio = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (titleRef.current && activeView === 'HOME') {
            const { bass, treble } = customEvent.detail;
            titleRef.current.style.transform = `scale(${1 + (bass * 0.03)})`;
            const overlayText = titleRef.current.querySelector('h1:first-child') as HTMLElement;
            if (overlayText) overlayText.style.opacity = `${0.9 + (treble * 0.1)}`; 
        }
    };
    window.addEventListener('audio-reactivity', handleAudio);
    return () => window.removeEventListener('audio-reactivity', handleAudio);
  }, [activeView]);

  const handleIgnition = async () => {
    if (!isIgnited) {
        await playIgnition();
        await startListening();
        setIsIgnited(true);
    }
  };

  const handleEnter = async () => {
      await handleIgnition();
      setActiveView('DRAFT'); // Default to Feed/Agent
  };

  const handleNav = (view: ViewState) => {
    playClick();
    setActiveView(prev => prev === view ? 'HOME' : view);
  };

  const registerIP = async () => {
      try {
        playClick();
        
        // 1. Wallet Check
        if (typeof (window as any).ethereum === 'undefined') {
            alert("NO WEB3 PROVIDER FOUND.");
            return;
        }

        setRegStatus("> CHECKING WALLET CONNECTION...");
        await new Promise(r => setTimeout(r, 500));

        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setNetwork(prev => ({ ...prev, isConnected: true, address: account }));

        setRegStatus("> VERIFYING ODYSSEY NETWORK...");
        const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId, 16) !== 1516) {
            try {
                await (window as any).ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x5ec' }], 
                });
            } catch {
                 setRegStatus("> ERROR: WRONG NETWORK.");
                 return;
            }
        }

        // 2. Simulation of Hashing / Metadata Upload
        setRegStatus("> GENERATING IPFS HASH...");
        await new Promise(r => setTimeout(r, 800));
        setRegStatus("> UPLOADING METADATA...");
        await new Promise(r => setTimeout(r, 800));

        // 3. Story Protocol Execution
        setRegStatus("> INITIALIZING STORY CLIENT...");
        
        try {
            // Dynamic Import
            const { StoryClient } = await import('@story-protocol/core-sdk');
            const { custom } = await import('viem');
            
            // NOTE: This requires a valid SPG NFT Contract address on Odyssey Testnet.
            // Since this rotates, we use a simulation if not configured.
            const SPG_NFT_CONTRACT = "0xc32A8a0E3BE33456608820249903a26A89A165e2"; // Example Testnet Address

            const client = StoryClient.newClient({
                transport: custom((window as any).ethereum),
                chainId: '1516' // Odyssey
            });
            
            setRegStatus("> MINTING IP ASSET ON-CHAIN...");
            
            // In a real deployment, this call works:
            // const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
            //     spgNftContract: SPG_NFT_CONTRACT,
            //     pilType: draft.ip.licenseTerms.type === 'NON_COMMERCIAL_REMIX' ? 'NON_COMMERCIAL_REMIX' : 'COMMERCIAL_USE',
            //     metadata: {
            //         metadataURI: "ipfs://" + draft.media.hash,
            //         metadataHash: draft.media.hash || "0x0",
            //         nftMetadataHash: "0x0",
            //         nftMetadataURI: "ipfs://"
            //     }
            // });
            
            // For safety in this demo environment, we simulate the successful return structure
            await new Promise(r => setTimeout(r, 2000));

            setDraft(prev => ({
                ...prev,
                ip: {
                    ...prev.ip,
                    status: 'REGISTERED',
                    id: '0x' + Math.random().toString(16).substr(2, 40), // Mock Address
                    owner: account
                }
            }));
            setRegStatus("> SUCCESS: ASSET INDEXED.");
            
        } catch (sdkError) {
            console.error("SDK Load Error", sdkError);
            setRegStatus("> SDK ERROR (CHECK CONSOLE)");
        }

      } catch (e) {
          setRegStatus("> TRANSACTION FAILED.");
      }
  };

  const renderActiveSection = () => {
    const config = SECTIONS.find(m => m.id === activeView);
    if (!config) return null;

    return (
      <div className="absolute inset-x-4 md:inset-x-12 bottom-0 top-24 z-20 animate-module-slide-up flex flex-col overflow-hidden rounded-t-2xl border-t border-l border-r border-white/10 shadow-2xl backdrop-blur-3xl bg-black/80">
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-bitcoin-orange rounded-full" />
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                      {config.label} // {config.subLabel}
                  </span>
              </div>
              <button onClick={() => setActiveView('HOME')} className="text-white/30 hover:text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 px-4 py-2 transition-colors rounded-full">
                  CLOSE
              </button>
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-hidden relative">
               {activeView === 'DRAFT' && (
                    <EditorSection 
                        draft={draft} 
                        onUpdate={setDraft} 
                        onRegister={registerIP} 
                        network={network}
                        regStatus={regStatus}
                    />
                )}
                {activeView === 'TERMS' && (
                    <TermsSection draft={draft} onUpdate={setDraft} />
                )}
                {activeView === 'MEDIA' && (
                   <MediaSection 
                        draft={draft}
                        onUpdate={setDraft}
                        isListening={isListening} 
                        startListening={startListening} 
                        analyser={analyserRef.current} 
                    />
                )}
          </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col relative font-serif text-white selection:bg-bitcoin-orange selection:text-black">
        <div className="absolute inset-0 z-0 pointer-events-none">
            <SpatialShell><div/></SpatialShell>
        </div>

        {/* Top Bar */}
        <div className="h-16 flex items-center justify-between px-8 z-50 shrink-0 relative">
             <div className="flex flex-col">
                 <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.3em]">RIOT ISSUE 1992</span>
             </div>
             <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                 <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                 <span className="font-mono text-[9px] tracking-widest text-white/30">
                    {isListening ? 'SOURCE' : 'OFF'}
                 </span>
             </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 relative w-full overflow-hidden perspective-1000">
            <div 
              className={`
                absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1)
                ${activeView !== 'HOME' ? 'opacity-0 scale-90 blur-md translate-z-[-100px] pointer-events-none' : 'opacity-100 scale-100 blur-0'}
              `}
            >
              <div 
                  ref={titleRef} 
                  className="relative text-center cursor-pointer group will-change-transform"
                  onClick={handleEnter}
              >
                  <h1 className="text-[12vw] md:text-[14vw] leading-[0.8] font-black tracking-tighter text-white/90 select-none transition-opacity duration-100">
                      ELECTRONIC
                  </h1>
                  <h1 className="text-[12vw] md:text-[14vw] leading-[0.8] font-black tracking-tighter text-bitcoin-orange/90 mix-blend-screen relative z-10 select-none transition-transform duration-75 group-hover:scale-[1.01]">
                      HOLLYWOOD
                  </h1>
                  <div className="mt-12 animate-pulse">
                      <span className="font-mono text-[10px] text-white/30 tracking-[0.4em] border border-white/10 px-6 py-3 rounded-full hover:bg-white/5 transition-colors uppercase">
                          FETCHING...
                      </span>
                  </div>
              </div>
            </div>

            {activeView !== 'HOME' && renderActiveSection()}
        </div>

        {/* NAV DECK */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-4 gap-4 md:gap-6 px-6 pb-8 z-50 relative shrink-0 perspective-1000">
            {SECTIONS.map((item, idx) => (
                <GlassPanel
                key={item.id}
                intensity="high"
                hoverEffect={true}
                active={activeView === item.id}
                onClick={() => { handleIgnition(); handleNav(item.id); }}
                onMouseEnter={() => playHover(idx)}
                className="flex flex-col justify-between p-5 group transition-transform aspect-[1.58/1]"
                >
                <div className="flex justify-between items-start">
                    <div className={`w-10 h-8 rounded-[4px] border transition-all duration-500 flex items-center justify-center ${activeView === item.id ? 'bg-bitcoin-orange/10 border-bitcoin-orange/30' : 'bg-white/[0.03] border-white/10'}`}>
                            <div className={`w-6 h-full border-x ${activeView === item.id ? 'border-bitcoin-orange/20' : 'border-white/5'}`} />
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${activeView === item.id ? 'bg-bitcoin-orange shadow-[0_0_10px_#F7941D]' : 'bg-white/5'}`} />
                </div>

                <div>
                    <span className={`font-serif font-medium text-lg md:text-xl tracking-tight leading-none block transition-all duration-300 ${activeView === item.id ? 'text-white drop-shadow-md' : 'text-white/40 mix-blend-overlay group-hover:text-white/70'}`}>
                        {item.label}
                    </span>
                    <span className="font-mono text-[8px] text-white/20 mt-2 block uppercase tracking-widest">{item.subLabel}</span>
                </div>
                </GlassPanel>
            ))}

            <GlassPanel
                intensity="medium"
                onClick={() => { if(confirm('TERMINATE SESSION?')) window.location.reload(); }}
                onMouseEnter={() => playHover(3)}
                className="group border-white/10 hover:border-white/30 aspect-[1.58/1] p-5 flex flex-col justify-between"
            >
                <div className="w-full h-0.5 bg-white/5" />
                <div className="flex flex-col relative z-10">
                    <span className="font-mono text-[9px] text-white/20 tracking-widest">SYSTEM</span>
                    <span className="font-serif font-medium text-lg md:text-xl tracking-tight leading-none text-white/30 group-hover:text-white transition-colors mix-blend-overlay group-hover:mix-blend-normal">
                    EXIT
                    </span>
                </div>
            </GlassPanel>
        </div>
    </div>
  );
};

export default App;
