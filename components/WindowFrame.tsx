
import React from 'react';

interface WindowFrameProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ title, onClose, children, className = "" }) => (
    <div className={`absolute inset-0 z-50 flex items-center justify-center p-8 animate-window-open ${className}`}>
        {/* The Window "Glass" */}
        <div className="w-full max-w-[1200px] h-[85vh] flex rounded-[40px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/10 backdrop-blur-[50px] bg-[#1c1c1e]/70 relative transition-transform">
            
            {/* Window Controls */}
            <div className="absolute top-6 right-6 z-50 flex gap-3">
                 <button className="w-3 h-3 rounded-full bg-[#F7931A]/80 hover:bg-[#F7931A] transition-colors" />
                 <button className="w-3 h-3 rounded-full bg-white/40 hover:bg-white/60 transition-colors" />
                 <button 
                    onClick={onClose} 
                    className="w-8 h-8 -mt-2.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white/80 hover:text-white"
                >
                    ✕
                </button>
            </div>
            {children}
        </div>
    </div>
);

export default WindowFrame;
