
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
    { id: 'u1', name: 'Producer_Dave', initials: 'PD', color: '#FF5733' }, // Orange
    { id: 'u2', name: 'Script_Doc_AI', initials: 'AI', color: '#33FF57' }, // Green
    { id: 'u3', name: 'Anon_Writer', initials: 'AW', color: '#3357FF' },   // Blue
    { id: 'u4', name: 'Director_X', initials: 'DX', color: '#F033FF' },    // Magenta
];

const FRAGMENTS = [
    "\n\n[PRODUCER_NOTE]: We need to clarify the stakes here. Can we raise the tension?",
    "\n\nAIKO\n(whispering)\nThey are watching us right now.",
    "\n\nEXT. NEON MARKET - NIGHT",
    "\n\nKENJI\nI don't deal in promises. I deal in memory.",
    "\n\n[NOTE]: Ensure this connects back to the Act 2 setup we discussed.",
    "\n\n[SYSTEM]: Auto-saving snapshot to IP Network...",
    "\n\n[DIRECTOR]: Let's cut this line. Less is more.",
    "\n\n(beat)\n",
];

const CHATS = [
    "I think the pacing in scene 3 is a bit slow.",
    "Can we check if this dialogue fits the character voice?",
    "Wait, didn't we say Kenji lost his arm?",
    "Loving the atmosphere here!",
    "Let's push the cyberpunk elements more.",
    "Should we roll for perception here?",
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
            text: `${firstUser.name} joined the room.`
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
                            text: `${nextUser.name} joined the room.`
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
