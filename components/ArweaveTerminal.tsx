
import React, { useState, useEffect, useRef } from 'react';
import WindowFrame from './WindowFrame';

interface ArweaveTerminalProps {
    onClose: () => void;
}

const ArweaveTerminal: React.FC<ArweaveTerminalProps> = ({ onClose }) => {
    const [activeCells, setActiveCells] = useState<number[]>([]);
    const [status, setStatus] = useState('BOOT_SEQUENCE');
    const [logs, setLogs] = useState<string[]>(["INITIALIZING HYPERBEAM..."]);
    const [gridCols, setGridCols] = useState(8);

    // Responsive Grid logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setGridCols(4); // Mobile
            else if (window.innerWidth < 1024) setGridCols(6); // Tablet
            else setGridCols(8); // Desktop
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const GRID_SIZE = gridCols * 8; // Maintain ratio

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            const newCells = [];
            const count = Math.floor(Math.random() * (gridCols)) + 2;
            for(let i=0; i<count; i++) {
                newCells.push(Math.floor(Math.random() * GRID_SIZE));
            }
            setActiveCells(newCells);

            if (Math.random() > 0.8) {
                const processId = Math.random().toString(36).substring(7).toUpperCase();
                setLogs(prev => [...prev.slice(-5), `PROCESS: [${processId}] -> ONLINE`]);
            }
        }, 200);

        setTimeout(() => setStatus('AO_GRID_ONLINE'), 1500);

        return () => clearInterval(interval);
    }, [gridCols, GRID_SIZE]);

    return (
        <WindowFrame title="AO Hyperbeam" onClose={onClose} className="z-[60]">
            <div className="flex w-full h-full bg-[#050505] relative overflow-hidden flex-col md:flex-row">
                {/* Background Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Left Panel: The Compute Grid */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:border-r border-[#00FF41]/20">
                    <div className="mb-4 text-center">
                        <div className="text-[#00FF41] text-[10px] md:text-xs font-mono tracking-[0.3em] mb-1">PARALLEL COMPUTE</div>
                        <div className="text-2xl md:text-4xl font-bold text-white font-sans tracking-tighter">AO NETWORK</div>
                    </div>

                    {/* Dynamic Voxel Grid */}
                    <div 
                        className="grid gap-1.5 md:gap-2 p-4 bg-[#00FF41]/5 rounded-xl border border-[#00FF41]/20 shadow-[0_0_50px_rgba(0,255,65,0.1)] transition-transform duration-700 perspective-1000"
                        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: GRID_SIZE }).map((_, i) => {
                            const isActive = activeCells.includes(i);
                            return (
                                <div 
                                    key={i}
                                    className={`
                                        w-6 h-6 md:w-8 md:h-8 rounded-sm transition-all duration-300
                                        ${isActive 
                                            ? 'bg-[#00FF41] shadow-[0_0_15px_#00FF41] scale-110' 
                                            : 'bg-[#00FF41]/10'
                                        }
                                    `}
                                />
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 flex gap-4 text-xs font-mono text-[#00FF41]/60">
                        <div>NODES: {gridCols}</div>
                        <div>THREADS: {activeCells.length}</div>
                    </div>
                </div>

                {/* Right Panel: Logs & Info */}
                <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col bg-[#050505]/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-[#00FF41]/20 pb-4">
                        <h3 className="text-white font-bold">Live Stream</h3>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${status === 'AO_GRID_ONLINE' ? 'bg-[#00FF41] text-black' : 'bg-yellow-500 text-black'}`}>
                            {status}
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 mb-4">
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-center gap-3 animate-fade-in-up">
                                <span className="text-[#00FF41] text-xs">➜</span>
                                <span className="font-mono text-xs text-[#00FF41] opacity-80">{log}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#1c1c1e] p-4 md:p-6 rounded-2xl border border-white/10 mt-auto">
                        <h4 className="text-white font-bold mb-1">Universal Data License</h4>
                        <p className="text-xs text-white/50 mb-3">
                            Atomic Assets minted here are permanent.
                        </p>
                        <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden">
                             <div className="h-full bg-[#00FF41] w-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default ArweaveTerminal;
