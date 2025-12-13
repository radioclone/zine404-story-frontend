
import React, { useState, useEffect, useCallback } from 'react';
import WindowFrame from './WindowFrame';

// Standard 5e Abilities
const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
type Ability = typeof ABILITIES[number];

interface CharacterState {
    name: string;
    class: string;
    level: number;
    stats: Record<Ability, number>;
}

const INITIAL_STATE: CharacterState = {
    name: 'Untitled Hero',
    class: 'Cyber-Ronin',
    level: 1,
    stats: {
        STR: 10,
        DEX: 14,
        CON: 12,
        INT: 13,
        WIS: 10,
        CHA: 8
    }
};

interface CharacterSheetProps {
    onClose: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onClose }) => {
    // --- STATE & HISTORY ---
    const [history, setHistory] = useState<CharacterState[]>([INITIAL_STATE]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [rollResult, setRollResult] = useState<{ total: number, breakdown: string } | null>(null);

    const currentState = history[historyIndex];

    const pushState = (newState: CharacterState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) setHistoryIndex(prev => prev - 1);
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) setHistoryIndex(prev => prev + 1);
    };

    // --- ACTIONS ---
    const updateStat = (ability: Ability, value: number) => {
        const val = Math.max(1, Math.min(20, value)); // Clamp 1-20
        const newState = {
            ...currentState,
            stats: { ...currentState.stats, [ability]: val }
        };
        if (JSON.stringify(newState) !== JSON.stringify(currentState)) {
            pushState(newState);
        }
    };

    const updateInfo = (field: 'name' | 'class' | 'level', value: string | number) => {
        const newState = { ...currentState, [field]: value };
        pushState(newState);
    };

    // --- LOGIC ---
    const getModifier = (score: number) => Math.floor((score - 10) / 2);
    
    const rollCheck = (ability: Ability) => {
        const mod = getModifier(currentState.stats[ability]);
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + mod;
        
        setRollResult({
            total,
            breakdown: `d20(${d20}) ${mod >= 0 ? '+' : ''}${mod} (${ability})`
        });
    };

    // Keyboard Shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                if (e.shiftKey) handleRedo();
                else handleUndo();
            } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history]);

    return (
        <WindowFrame title="Hero Architect // v1.0" onClose={onClose}>
            <div className="flex w-full h-full p-4 md:p-8 gap-8 overflow-hidden relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                {/* LEFT: CHARACTER CARD */}
                <div className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto z-10">
                    
                    {/* Header: Name & Class */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b border-red-500/20 pb-6">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] uppercase font-mono text-red-500/60 tracking-widest mb-1 block">Identity</label>
                            <input 
                                type="text" 
                                value={currentState.name}
                                onChange={(e) => updateInfo('name', e.target.value)}
                                className="w-full bg-transparent text-3xl md:text-5xl font-bold text-white font-sans outline-none placeholder-white/20"
                                placeholder="CHARACTER NAME"
                            />
                        </div>
                        <div className="flex gap-4">
                             <div>
                                <label className="text-[10px] uppercase font-mono text-red-500/60 tracking-widest mb-1 block">Archetype</label>
                                <input 
                                    type="text" 
                                    value={currentState.class}
                                    onChange={(e) => updateInfo('class', e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm w-32 focus:border-red-500/50 outline-none transition-colors"
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-mono text-red-500/60 tracking-widest mb-1 block">Level</label>
                                <input 
                                    type="number" 
                                    value={currentState.level}
                                    onChange={(e) => updateInfo('level', parseInt(e.target.value) || 1)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm w-16 text-center focus:border-red-500/50 outline-none transition-colors"
                                />
                             </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ABILITIES.map(ability => {
                            const score = currentState.stats[ability];
                            const mod = getModifier(score);
                            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

                            return (
                                <div key={ability} className="relative group">
                                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-red-500/40 transition-colors shadow-lg">
                                        <div className="text-red-500 font-bold font-mono text-sm tracking-widest">{ability}</div>
                                        
                                        {/* Modifier (Big) */}
                                        <div className="text-4xl font-bold text-white tabular-nums relative">
                                            {modStr}
                                            {/* Roll Button Overlay */}
                                            <button 
                                                onClick={() => rollCheck(ability)}
                                                className="absolute inset-0 flex items-center justify-center bg-red-500 text-black text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                            >
                                                ROLL
                                            </button>
                                        </div>

                                        {/* Score (Small Input) */}
                                        <div className="flex items-center gap-2 bg-white/5 rounded-full px-2 py-1 mt-1">
                                            <button 
                                                onClick={() => updateStat(ability, score - 1)}
                                                className="text-white/40 hover:text-white w-4 h-4 flex items-center justify-center"
                                            >-</button>
                                            <span className="text-xs font-mono text-white/60 w-4 text-center">{score}</span>
                                            <button 
                                                onClick={() => updateStat(ability, score + 1)}
                                                className="text-white/40 hover:text-white w-4 h-4 flex items-center justify-center"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Undo/Redo Controls */}
                    <div className="flex justify-center gap-4 mt-auto pt-4 border-t border-white/5">
                        <button 
                            onClick={handleUndo} 
                            disabled={historyIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all font-mono text-sm"
                        >
                            <span>↶</span> UNDO
                        </button>
                        <span className="text-white/20 py-2 font-mono text-xs">
                             v{historyIndex + 1}
                        </span>
                        <button 
                            onClick={handleRedo} 
                            disabled={historyIndex === history.length - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all font-mono text-sm"
                        >
                            REDO <span>↷</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT: DICE TRAY LOG */}
                <div className="w-64 border-l border-white/10 pl-8 hidden md:flex flex-col">
                    <h3 className="text-white/40 font-mono text-xs uppercase tracking-widest mb-4">Roll Log</h3>
                    
                    {rollResult && (
                         <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center mb-6 animate-scale-in">
                             <div className="text-[10px] text-red-400 font-mono mb-1 uppercase tracking-wider">Result</div>
                             <div className="text-5xl font-bold text-white mb-2">{rollResult.total}</div>
                             <div className="text-xs text-white/50 font-mono">{rollResult.breakdown}</div>
                         </div>
                    )}

                    <div className="flex-1 flex items-end justify-center pb-8 opacity-20 hover:opacity-100 transition-opacity">
                        <div className="text-center space-y-2">
                             <div className="text-4xl">🎲</div>
                             <div className="text-[10px] font-mono">D&D 5E ARCHITECT</div>
                        </div>
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default CharacterSheet;
