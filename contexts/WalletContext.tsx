import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet, WalletState } from '../hooks/useWallet';

const WalletContext = createContext<WalletState | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const wallet = useWallet();
    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWalletContext = () => {
    const context = useContext(WalletContext);
    if (!context) throw new Error("useWalletContext must be used within a WalletProvider");
    return context;
};
