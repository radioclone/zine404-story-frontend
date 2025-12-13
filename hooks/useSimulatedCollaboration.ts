
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './useLiveAgent';

export interface Collaborator {
    id: string;
    name: string;
    color: string; // Hex color for avatar border/cursor
    initials: string;
    status: 'IDLE' | 'TYPING' | 'VIEWING';
}

const MOCK_USERS = [
    { id: 'u1', name: 'Lore_Keeper_DAO', initials: 'LK', color: '#8b5cf6' }, // Purple
    { id: 'u2', name: 'FX_Specialist_AI', initials: 'FX', color: '#00FF41' }, // Cyber Green
    { id: 'u3', name: 'Rules_Lawyer_Bob', initials: 'RL', color: '#FF5733' },   // Orange
    { id: 'u4', name: 'Concept_Artist_X', initials: 'CX', color: '#F033FF' },    // Magenta
];

const FRAGMENTS = [
    "\n\n[LORE UPDATE]: The mana crystals are unstable in this district.",
    "\n\nBRIX\n(yelling)\nI rage!",
    "\n\n[VISUAL CUE]: Camera dolly zoom on the artifact.",
    "\n\n[GM]: Roll for initiative.",
    "\n\nVALERIUS\nI cast Charm Person on the guard.",
    "\n\n[SYSTEM]: Guild Wallet received 0.5 ETH for Asset #402.",
    "\n\n[DIRECTOR]: Let's tighten the pacing here. Cut the monologue.",
    "\n\n(beat)\n",
];

const CHATS = [
    "I think we should mint this character sheet as an NFT.",
    "Can we get an AI visual for the dragon?",
    "That roll was definitely faked lol.",
    "The atmosphere here feels very Stranger Things S4.",
    "Should we token-gate this plot twist?",
    "Wait, is this canon to the wider campaign?",
];

export const useSimulatedCollaboration = (
    setContent: React.Dispatch<React.SetStateAction<string>>,
    addMessage: (msg: ChatMessage) => void
) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const collaboratorsRef = useRef<Collaborator[]>([]); // Ref to access latest in closures

    useEffect(() => {
        collaboratorsRef.current = collaborators;
    }, [collaborators]);
    
    // 1. Simulation: Users Joining
    useEffect(() => {
        // Add the first user immediately
        const firstUser = { ...MOCK_USERS[0], status: 'VIEWING' as const };
        setCollaborators([firstUser]);
        
        // Announce join
        addMessage({
            id: Date.now().toString(),
            role: 'system',
            text: `${firstUser.name} joined the Guild Session.`
        });

        const interval = setInterval(() => {
            setCollaborators(prev => {
                if (prev.length < 3 && Math.random() > 0.6) {
                    const nextUser = MOCK_USERS[prev.length];
                    if (nextUser) {
                        // Announce join
                        addMessage({
                            id: Date.now().toString(),
                            role: 'system',
                            text: `${nextUser.name} joined the Guild Session.`
                        });
                        return [...prev, { ...nextUser, status: 'VIEWING' as const }];
                    }
                }
                return prev;
            });
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    // 2. Simulation: Event Loop (Typing & Chatting)
    useEffect(() => {
        if (collaborators.length === 0) return;

        const loop = setInterval(() => {
            const currentCollabs = collaboratorsRef.current;
            if (currentCollabs.length === 0) return;

            const activeIdx = Math.floor(Math.random() * currentCollabs.length);
            const user = currentCollabs[activeIdx];
            
            // 30% chance to Chat, 70% to Edit
            const isChat = Math.random() > 0.7;

            if (isChat) {
                // CHAT ACTION
                 setCollaborators(prev => prev.map((c, i) => 
                    i === activeIdx ? { ...c, status: 'TYPING' } : c
                ));
                
                setTimeout(() => {
                    const text = CHATS[Math.floor(Math.random() * CHATS.length)];
                    addMessage({
                        id: Date.now().toString(),
                        role: 'collaborator',
                        text: text,
                        author: user.name,
                        color: user.color
                    });
                    
                     setCollaborators(prev => prev.map((c, i) => 
                        i === activeIdx ? { ...c, status: 'VIEWING' } : c
                    ));
                }, 1500);

            } else {
                // EDIT ACTION (Streamed)
                setCollaborators(prev => prev.map((c, i) => 
                    i === activeIdx ? { ...c, status: 'TYPING' } : c
                ));

                const fragment = FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)];
                let charIdx = 0;
                
                // Simulate fast typing
                const typeTimer = setInterval(() => {
                    if (charIdx < fragment.length) {
                        const char = fragment[charIdx];
                        setContent(prev => prev + char);
                        charIdx++;
                    } else {
                        clearInterval(typeTimer);
                         setCollaborators(prev => prev.map((c, i) => 
                            i === activeIdx ? { ...c, status: 'VIEWING' } : c
                        ));
                    }
                }, 50); // 50ms per char
            }

        }, 10000); // Trigger event every 10s

        return () => clearInterval(loop);
    }, [collaborators.length, setContent, addMessage]); 

    return { collaborators };
};
