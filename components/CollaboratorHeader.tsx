
import React from 'react';
import { Collaborator } from '../hooks/useSimulatedCollaboration';

interface CollaboratorHeaderProps {
    collaborators: Collaborator[];
}

const CollaboratorHeader: React.FC<CollaboratorHeaderProps> = ({ collaborators }) => {
    return (
        <div className="flex -space-x-2 items-center">
        {collaborators.map(c => (
            <div key={c.id} className="relative group cursor-pointer">
                <div 
                    className={`
                        w-8 h-8 rounded-full border-2 border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-black
                        transition-all duration-300
                        ${c.status === 'TYPING' ? 'animate-bounce scale-110' : ''}
                    `}
                    style={{ backgroundColor: c.color }}
                >
                    {c.initials}
                </div>
                {/* Status Dot */}
                <div className={`
                    absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1c1c1e]
                    ${c.status === 'TYPING' ? 'bg-green-400' : 'bg-green-800'}
                `}/>
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                    {c.name} {c.status === 'TYPING' && '(Typing...)'}
                </div>
            </div>
        ))}
        {collaborators.length > 0 && (
            <div className="ml-4 text-xs font-mono text-white/30">
                {collaborators.length} ONLINE
            </div>
        )}
        </div>
    );
};

export default CollaboratorHeader;
