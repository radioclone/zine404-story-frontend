
import React, { useRef } from 'react';
import { IconData } from '../types';
import { PixelIcons } from './PixelIcons';

interface DraggableIconProps {
    iconData: IconData;
    onUpdatePos: (id: string, x: number, y: number) => void;
    onAction: (id: string) => void;
    onDragEnd: (id: string) => void;
    onHover: () => void;
}

const DraggableIcon: React.FC<DraggableIconProps> = ({ iconData, onUpdatePos, onAction, onDragEnd, onHover }) => {
    // Select Icon Component
    let IconComponent = PixelIcons.File;
    if (iconData.type === 'NODE') IconComponent = PixelIcons.StoryNode;
    if (iconData.type === 'APP') IconComponent = PixelIcons.IpLauncher;
    if (iconData.type === 'TRASH') IconComponent = PixelIcons.Trash;
    if (iconData.type === 'FOLDER') IconComponent = PixelIcons.Folder;
    if (iconData.type === 'MUSIC') IconComponent = PixelIcons.Music;
    if (iconData.type === 'SHOPPING') IconComponent = PixelIcons.Shopping;
    if (iconData.type === 'TIMER') IconComponent = PixelIcons.Timer;
    if (iconData.type === 'BOOK') IconComponent = PixelIcons.Book;
    if (iconData.type === 'ARWEAVE') IconComponent = PixelIcons.ArweaveTerminal;
    if (iconData.type === 'MARKET') IconComponent = PixelIcons.Market;
    if (iconData.type === 'SHEET') IconComponent = PixelIcons.D20;

    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault(); 
        dragging.current = true;
        offset.current = { x: e.clientX - iconData.x, y: e.clientY - iconData.y };
        startPos.current = { x: e.clientX, y: e.clientY };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (dragging.current) {
            onUpdatePos(iconData.id, e.clientX - offset.current.x, e.clientY - offset.current.y);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        dragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        const dist = Math.sqrt(Math.pow(e.clientX - startPos.current.x, 2) + Math.pow(e.clientY - startPos.current.y, 2));
        if (dist < 5) onAction(iconData.id);
        else onDragEnd(iconData.id);
    };

    // The "Glass Sphere" Skin Configuration
    // Replicating the glossy bubble look from the reference image
    const sphereClasses = `
        w-24 h-24 rounded-full
        bg-black/60
        border border-white/10
        relative flex items-center justify-center
        transition-all duration-300
        shadow-[0_10px_30px_rgba(0,0,0,0.5),_inset_0_4px_20px_rgba(255,255,255,0.1),_inset_0_-10px_20px_rgba(0,0,0,0.8)]
        group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15),_inset_0_4px_20px_rgba(255,255,255,0.2),_inset_0_-10px_20px_rgba(0,0,0,0.8)]
        group-hover:scale-105
        group-hover:border-white/30
    `;

    return (
        <div 
            onMouseDown={handleMouseDown}
            onMouseEnter={onHover}
            style={{ left: iconData.x, top: iconData.y }}
            className="absolute flex flex-col items-center gap-3 p-2 cursor-pointer group z-10 hover:z-50 active:z-50 touch-none"
        >
            {/* GLASS ORB CONTAINER */}
            <div className={sphereClasses}>
                 
                 {/* Specular Highlight (The Shine) */}
                 <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50" />
                 
                 {/* Inner Icon */}
                 <div className="relative z-10 w-12 h-12 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                     {iconData.iconImage ? (
                        <img 
                            src={iconData.iconImage} 
                            alt={iconData.label} 
                            className="w-full h-full object-contain" 
                        />
                    ) : (
                        <IconComponent 
                            className="w-full h-full" 
                            // Force white/bright colors for better contrast inside the dark sphere
                            color={iconData.type === 'FOLDER' ? '#3b82f6' : '#e4e4e7'} 
                        />
                    )}
                 </div>
            </div>
            
            {/* Label - Pixel Font Update */}
            <span className="font-pixel text-[10px] md:text-xs tracking-widest text-white/80 drop-shadow-md bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm group-hover:text-white transition-colors uppercase max-w-[120px] text-center leading-tight truncate">
                {iconData.label}
            </span>
        </div>
    );
};

export default DraggableIcon;
