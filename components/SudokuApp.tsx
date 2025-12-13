
import React, { useState, useEffect, useCallback } from 'react';
import WindowFrame from './WindowFrame';

// Easy Static Puzzle for demonstration
const INITIAL_PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

interface SudokuAppProps {
    onClose: () => void;
}

const SudokuApp: React.FC<SudokuAppProps> = ({ onClose }) => {
    // History State management
    // We store the full board state for simplicity and robustness in undo/redo
    const [history, setHistory] = useState<number[][][]>([INITIAL_PUZZLE.map(row => [...row])]);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);

    // Derived current board
    const currentBoard = history[currentStep];

    const handleCellChange = (r: number, c: number, value: number) => {
        if (INITIAL_PUZZLE[r][c] !== 0) return; // Prevent editing initial cells

        // Create deep copy of current board
        const newBoard = currentBoard.map(row => [...row]);
        newBoard[r][c] = value;

        // Slice history if we are in the middle of a stack (Redo branch cut)
        const newHistory = history.slice(0, currentStep + 1);
        newHistory.push(newBoard);

        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    };

    const handleUndo = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleRedo = useCallback(() => {
        if (currentStep < history.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, history.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectedCell) return;

        const { r, c } = selectedCell;
        
        // Number Inputs
        if (e.key >= '1' && e.key <= '9') {
            handleCellChange(r, c, parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            handleCellChange(r, c, 0);
        } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            if (e.shiftKey) handleRedo();
            else handleUndo();
        } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
            handleRedo();
        }

        // Navigation
        if (e.key === 'ArrowUp') setSelectedCell({ r: Math.max(0, r - 1), c });
        if (e.key === 'ArrowDown') setSelectedCell({ r: Math.min(8, r + 1), c });
        if (e.key === 'ArrowLeft') setSelectedCell({ r, c: Math.max(0, c - 1) });
        if (e.key === 'ArrowRight') setSelectedCell({ r, c: Math.min(8, c + 1) });
    }, [selectedCell, currentBoard, handleUndo, handleRedo]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <WindowFrame title="Mind Grid // Sudoku" onClose={onClose}>
            <div className="flex w-full h-full items-center justify-center bg-[#050505] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#10b981]/10 via-transparent to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-center z-10 p-4">
                    {/* Game Board */}
                    <div className="bg-black/40 p-4 rounded-xl border border-[#10b981]/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                        <div className="grid grid-cols-9 gap-px bg-[#10b981]/20 border-2 border-[#10b981]/50">
                            {currentBoard.map((row, r) => (
                                row.map((cell, c) => {
                                    const isInitial = INITIAL_PUZZLE[r][c] !== 0;
                                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                    
                                    // Borders for 3x3 grids
                                    const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-[#10b981]/40' : '';
                                    const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-[#10b981]/40' : '';

                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            onClick={() => setSelectedCell({ r, c })}
                                            className={`
                                                w-8 h-8 md:w-12 md:h-12 flex items-center justify-center
                                                text-lg md:text-2xl font-mono cursor-pointer transition-colors
                                                ${borderRight} ${borderBottom}
                                                ${isSelected ? 'bg-[#10b981]/40 text-white' : 'hover:bg-white/5'}
                                                ${isInitial ? 'text-[#10b981] font-bold' : 'text-white'}
                                            `}
                                        >
                                            {cell !== 0 ? cell : ''}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 min-w-[200px]">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <h2 className="text-[#10b981] font-bold font-mono text-xl mb-4 tracking-widest">CONTROLS</h2>
                            
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={handleUndo}
                                    disabled={currentStep === 0}
                                    className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 transition-all text-sm font-bold font-mono"
                                >
                                    ↶ UNDO
                                </button>
                                <button
                                    onClick={handleRedo}
                                    disabled={currentStep === history.length - 1}
                                    className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 transition-all text-sm font-bold font-mono"
                                >
                                    REDO ↷
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[1,2,3,4,5,6,7,8,9].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => selectedCell && handleCellChange(selectedCell.r, selectedCell.c, num)}
                                        className="py-3 rounded bg-black/40 border border-white/10 hover:border-[#10b981] hover:text-[#10b981] transition-all font-mono text-lg"
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-xs text-white/40 font-mono">Moves: {currentStep}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WindowFrame>
    );
};

export default SudokuApp;
