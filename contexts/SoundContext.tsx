import React, { createContext, useContext, ReactNode } from 'react';
import { useUiSounds } from '../hooks/useUiSounds';

type SoundContextType = ReturnType<typeof useUiSounds>;

const SoundContext = createContext<SoundContextType | null>(null);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const sounds = useUiSounds();
    return (
        <SoundContext.Provider value={sounds}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSoundContext = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error("useSoundContext must be used within a SoundProvider");
    return context;
};
