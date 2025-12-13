
import React from 'react';
import { MuzeSuggestion } from '../hooks/useLiveAgent';

interface SuggestionOverlayProps {
    suggestion: MuzeSuggestion;
    onAccept: () => void;
    onDiscard: () => void;
}

const SuggestionOverlay: React.FC<SuggestionOverlayProps> = ({ suggestion, onAccept, onDiscard }) => {
    return (
        <div className="absolute bottom-6 left-6 right-6 bg-[#1c1c1e] border border-[#F7931A] p-6 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-scale-in z-20">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#F7931A] rounded-full animate-pulse"/>
                <h4 className="text-[#F7931A] font-mono font-bold text-sm tracking-widest">MUZE SUGGESTION</h4>
                </div>
                <button onClick={onDiscard} className="text-white/40 hover:text-white transition-colors">✕</button>
            </div>
            
            <p className="text-xs text-white/60 mb-3 font-mono border-b border-white/10 pb-3 leading-relaxed">
            <span className="text-[#F7931A]/80 font-bold">RATIONALE:</span> {suggestion.rationale}
            </p>
            
            <div className="bg-black/40 p-4 rounded-lg text-white/90 font-mono text-sm mb-4 border-l-2 border-[#F7931A] whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                {suggestion.text}
            </div>
            
            <div className="flex gap-3">
                <button 
                onClick={onAccept} 
                className="bg-[#F7931A] text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#ffad42] transition-colors shadow-lg"
                >
                    Accept & Append
                </button>
                <button 
                onClick={onDiscard} 
                className="bg-white/10 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                    Discard
                </button>
            </div>
        </div>
    );
};

export default SuggestionOverlay;
