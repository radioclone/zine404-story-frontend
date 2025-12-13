
import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';

const MenuBar: React.FC = () => {
    const { address: walletAddress } = useWalletContext();

    return (
        <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:h-14 py-3 md:py-0 px-4 md:px-8 rounded-full bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 z-[60] flex items-center justify-between md:justify-center md:gap-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] hover:bg-[#1c1c1e]/80">
            <div className="flex items-center gap-2 shrink-0">
                {/* Updated to font-pixel for Retro OS look */}
                <span className="font-pixel font-bold text-lg md:text-xl tracking-widest text-white drop-shadow-md">STORY<span className="text-[#F7931A]/80 font-normal">OS</span></span>
            </div>
            
            <div className="flex gap-1">
                 {/* Spacer / Dynamic Island Area if needed */}
            </div>

            <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs font-mono whitespace-nowrap">
                {walletAddress ? (
                    <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/40 text-[#F7931A] shadow-[0_0_10px_rgba(247,147,26,0.2)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A] animate-pulse"/>
                        <span className="hidden md:inline">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span>
                        <span className="md:hidden">{walletAddress.slice(0,4)}...</span>
                    </div>
                ) : (
                     <span className="opacity-50">OFFLINE</span>
                )}
                <span className="opacity-60 hidden md:inline">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    );
};

export default MenuBar;
