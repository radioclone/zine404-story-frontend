
import React from 'react';

interface WindowFrameProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ title, onClose, children, className = "" }) => (
    <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-window-open ${className}`}>
        {/* 
            GLASS WINDOW PANE 
            - Dark tint with high blur (backdrop-blur-3xl)
            - Noise texture overlay for analog feel
            - Double border (ring + border) for depth
        */}
        <div className="w-full max-w-[1200px] h-[85vh] flex rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.08] ring-1 ring-black/50 backdrop-blur-3xl bg-[#050505]/80 relative transition-transform">
            
            {/* Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />
            
            {/* Window Controls Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-50 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex gap-2">
                    <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 shadow-[0_0_10px_rgba(255,95,87,0.3)] transition-all" />
                    <button className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 shadow-[0_0_10px_rgba(254,188,46,0.3)] transition-all" />
                    <button className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 shadow-[0_0_10px_rgba(40,200,64,0.3)] transition-all" />
                </div>
                <span className="font-mono text-xs text-white/30 uppercase tracking-[0.2em] select-none">{title}</span>
                <div className="w-16" /> {/* Spacer for centering */}
            </div>

            {/* Content Area */}
            <div className="relative z-10 w-full h-full pt-16">
                {children}
            </div>
        </div>
    </div>
);

export default WindowFrame;
