
import React from 'react';

interface WindowFrameProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ title, onClose, children, className = "" }) => (
    <div className={`absolute inset-0 z-50 flex items-center justify-center p-2 md:p-8 pt-20 md:pt-28 animate-window-open ${className}`}>
        {/* 
            GLASS WINDOW PANE 
            - Mobile: Full width minus padding, slightly taller
            - Desktop: Max width 1200px
            - Responsive padding and border radius
        */}
        <div className="w-full max-w-[1200px] h-full max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)] flex flex-col rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.08] ring-1 ring-black/50 backdrop-blur-3xl bg-[#050505]/80 relative transition-transform">
            
            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />
            
            {/* Window Controls Bar */}
            <div className="relative shrink-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 z-50 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex gap-2">
                    <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 shadow-[0_0_10px_rgba(255,95,87,0.3)] transition-all" />
                    <button className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 shadow-[0_0_10px_rgba(254,188,46,0.3)] transition-all" />
                    <button className="hidden md:block w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 shadow-[0_0_10px_rgba(40,200,64,0.3)] transition-all" />
                </div>
                <span className="font-mono text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em] select-none truncate px-4">{title}</span>
                <div className="w-8 md:w-16" /> {/* Spacer for centering */}
            </div>

            {/* Content Area */}
            <div className="relative z-10 w-full h-full flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    </div>
);

export default WindowFrame;
