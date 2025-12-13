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

    const isLauncher = iconData.type === 'APP';

    return (
        <div 
            onMouseDown={handleMouseDown}
            onMouseEnter={onHover}
            style={{ left: iconData.x, top: iconData.y }}
            className="absolute flex flex-col items-center gap-3 p-2 cursor-pointer group z-10 w-28 md:w-40 lg:w-48 touch-none"
        >
            <div className={`
                w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex items-center justify-center relative transition-all duration-300 ease-out
                group-hover:-translate-y-2 group-active:scale-95
            `}>
                {/* Bitcoin Orange Glow Effect - Refined for subtlety */}
                 <div className={`
                    absolute inset-0 blur-xl transition-all duration-500 rounded-full
                    ${isLauncher 
                        ? 'bg-[#F7931A]/0 group-hover:bg-[#F7931A]/30' // Subtle glow on hover
                        : 'bg-white/0'
                    }
                `} />
                
                {isLauncher ? (
                     <div className="relative w-full h-full rounded-full border border-white/10 bg-[#1c1c1e]/60 backdrop-blur-md flex items-center justify-center group-hover:border-[#F7931A]/50 transition-colors shadow-lg">
                        {/* Inner Ring */}
                         <div className="absolute inset-1 rounded-full border border-white/5 group-hover:border-[#F7931A]/20 transition-colors" />
                         
                         {iconData.iconImage ? (
                            <img 
                                src={iconData.iconImage} 
                                alt={iconData.label} 
                                className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-lg relative z-10" 
                                style={{ imageRendering: 'pixelated' }}
                            />
                        ) : (
                            <IconComponent className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 relative z-10 text-[#F7931A] drop-shadow-[0_0_10px_rgba(247,147,26,0.5)]" />
                        )}
                     </div>
                ) : (
                    <>
                        {iconData.iconImage ? (
                            <img 
                                src={iconData.iconImage} 
                                alt={iconData.label} 
                                className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 object-contain drop-shadow-2xl relative z-10"
                                style={{ imageRendering: 'pixelated' }} 
                            />
                        ) : (
                            // Pixel Art Desktop Icons - SCALED UP
                            <IconComponent className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 relative z-10 text-white/90 drop-shadow-2xl group-hover:scale-105 group-hover:text-white transition-all duration-300" />
                        )}
                    </>
                )}
            </div>
            
            <span className={`
                font-mono text-xs md:text-sm lg:text-base font-medium px-3 py-1.5 rounded-md backdrop-blur-md border transition-all duration-300
                shadow-lg max-w-full break-words text-center leading-tight select-none tracking-wide
                ${isLauncher 
                    ? 'bg-[#F7931A]/80 border-[#F7931A]/50 text-white shadow-[#F7931A]/20 group-hover:bg-[#F7931A] group-hover:shadow-[#F7931A]/40 group-hover:scale-105' 
                    : 'bg-black/40 border-white/5 text-white/80 group-hover:bg-black/70 group-hover:border-white/20 group-hover:text-white group-hover:scale-105'
                }
            `}>
                {iconData.label}
            </span>
        </div>
    );
};

export default DraggableIcon;
