
import { useState, useEffect } from 'react';

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

const MOCK_FRAGMENTS = [
    "\n\n[PRODUCER_NOTE]: We need to clarify the stakes here. Can we raise the tension?",
    "\n\nAIKO\n(whispering)\nThey are watching us right now.",
    "\n\nEXT. NEON MARKET - NIGHT",
    "\n\nKENJI\nI don't deal in promises. I deal in memory.",
    "\n\n[NOTE]: Ensure this connects back to the Act 2 setup we discussed.",
    "\n\n[SYSTEM]: Auto-saving snapshot to IP Network...",
    "\n\n[DIRECTOR]: Let's cut this line. Less is more.",
    "\n\n(beat)\n",
];

export const useSimulatedCollaboration = (
    setContent: React.Dispatch<React.SetStateAction<string>>
) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    
    // 1. Simulation: Users Joining
    useEffect(() => {
        // Add the first user immediately
        setCollaborators([ { ...MOCK_USERS[0], status: 'VIEWING' } ]);

        const interval = setInterval(() => {
            setCollaborators(prev => {
                // Cap at 3 mock users
                if (prev.length < 3 && Math.random() > 0.6) {
                    const nextUser = MOCK_USERS[prev.length];
                    if (nextUser) return [...prev, { ...nextUser, status: 'VIEWING' }];
                }
                return prev;
            });
        }, 8000); // Try to add a user every 8s

        return () => clearInterval(interval);
    }, []);

    // 2. Simulation: Users Typing & Editing
    useEffect(() => {
        if (collaborators.length === 0) return;

        const loop = setInterval(() => {
            // Pick a random user
            const activeIdx = Math.floor(Math.random() * collaborators.length);
            
            // Set status to TYPING
            setCollaborators(prev => prev.map((c, i) => 
                i === activeIdx ? { ...c, status: 'TYPING' } : c
            ));

            // Commit the edit after a delay (simulating typing time)
            setTimeout(() => {
                const fragment = MOCK_FRAGMENTS[Math.floor(Math.random() * MOCK_FRAGMENTS.length)];
                
                // Append text to the document
                setContent(prev => prev + fragment);

                // Reset status to VIEWING
                setCollaborators(prev => prev.map((c, i) => 
                    i === activeIdx ? { ...c, status: 'VIEWING' } : c
                ));
            }, 2500);

        }, 15000); // Trigger an edit event every 15 seconds

        return () => clearInterval(loop);
    }, [collaborators.length, setContent]); 

    return { collaborators };
};
