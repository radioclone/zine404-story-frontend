
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

    // Color Palette - Used for the subtle hover glow
    const getIconColor = (type: string) => {
        switch(type) {
            case 'NODE': return '#FF5733'; // Story Orange
            case 'APP': return '#38BDF8'; // Sky Blue
            case 'TRASH': return '#A1A1AA'; // Zinc
            case 'FOLDER': return '#60A5FA'; // Blue
            case 'MUSIC': return '#F472B6'; // Pink
            case 'SHOPPING': return '#F43F5E'; // Rose
            case 'TIMER': return '#2DD4BF'; // Teal
            case 'BOOK': return '#A78BFA'; // Violet
            case 'ARWEAVE': return '#4ADE80'; // Green
            case 'MARKET': return '#FBBF24'; // Amber
            case 'SHEET': return '#F87171'; // Red
            case 'FILE': return '#E4E4E7'; // Zinc
            default: return '#E4E4E7';
        }
    }

    const iconColor = getIconColor(iconData.type);

    // Nintendo Minimalist Aesthetic
    // - Circular
    // - Very subtle, low opacity background
    // - High blur for that "frosted" look
    // - Muted icons that saturate on hover
    const sphereClasses = `
        w-20 h-20 md:w-24 md:h-24 rounded-full
        bg-white/[0.02] backdrop-blur-md
        border border-white/[0.08]
        flex items-center justify-center
        relative
        transition-all duration-500 ease-out
        shadow-[0_4px_24px_rgba(0,0,0,0.1)]
        
        /* Interactive State: Subtle Glow & Lift */
        group-hover:scale-110 
        group-hover:-translate-y-2
        group-hover:bg-white/[0.08]
        group-hover:border-white/[0.2]
        group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.3),_inset_0_0_20px_rgba(255,255,255,0.05)]
        
        active:scale-95 active:duration-100
    `;

    return (
        <div 
            onMouseDown={handleMouseDown}
            onMouseEnter={onHover}
            style={{ left: iconData.x, top: iconData.y }}
            className="absolute flex flex-col items-center gap-3 p-2 cursor-pointer group z-10 hover:z-50 active:z-50 touch-none select-none"
        >
            {/* Minimalist Sphere Container */}
            <div className={sphereClasses}>
                 
                 {/* Inner Icon - Muted (Grayscale) by default, Full Color on Hover */}
                 <div className="
                    relative z-10 w-9 h-9 md:w-11 md:h-11 
                    transition-all duration-500 
                    opacity-50 grayscale brightness-125
                    group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110
                 ">
                     {iconData.iconImage ? (
                        <img 
                            src={iconData.iconImage} 
                            alt={iconData.label} 
                            className="w-full h-full object-contain" 
                        />
                    ) : (
                        <IconComponent 
                            className="w-full h-full drop-shadow-md" 
                            color={iconColor}
                        />
                    )}
                 </div>
            </div>
            
            {/* Label - Clean text, no box */}
            <span className="
                font-pixel text-[10px] md:text-xs tracking-[0.2em] text-white/30 
                group-hover:text-white transition-colors duration-300 uppercase 
                max-w-[100px] text-center leading-tight truncate
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
            ">
                {iconData.label}
            </span>
        </div>
    );
};

export default DraggableIcon;
