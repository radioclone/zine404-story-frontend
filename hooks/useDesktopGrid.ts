
import { useState, useEffect, useCallback } from 'react';
import { IconData } from '../types';

export const useDesktopGrid = () => {
    const calculateGrid = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Responsive Constants
        const isMobile = w < 640;
        const isTablet = w >= 640 && w < 1024;
        
        // Grid Spacing
        const startX = isMobile ? 20 : 40;
        const startY = isMobile ? 100 : 120;
        const colStride = isMobile ? 90 : (isTablet ? 110 : 140);
        const rowStride = isMobile ? 110 : (isTablet ? 130 : 160);
        
        // Trash Position (Bottom Right)
        const trashX = w - (isMobile ? 80 : 120);
        const trashY = h - (isMobile ? 100 : 140);

        // Define Grid Positions
        // Mobile: 3 columns max, tighter packing
        // Desktop: Vertical columns on left
        
        const getPos = (col: number, row: number) => ({
            x: startX + (col * colStride),
            y: startY + (row * rowStride)
        });

        return [
            // Column 1
            { id: 'node', label: 'Story Network', ...getPos(0, 0), type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', ...getPos(0, 1), type: 'APP' },
            { id: 'manifesto', label: 'Manifesto.txt', ...getPos(0, 2), type: 'FILE' },

            // Column 2
            { id: 'ao_terminal', label: 'AO Hyperbeam', ...getPos(1, 0), type: 'ARWEAVE' },
            { id: 'bazar', label: 'Bazar Mkt', ...getPos(1, 1), type: 'MARKET' },
            { id: 'draft', label: 'Draft_v1.txt', ...getPos(1, 2), type: 'FILE' },

            // Column 3 (On mobile, might wrap or push down if screen is narrow, but x=180 usually fits)
            { id: 'music', label: 'Music', ...getPos(isMobile ? 0 : 2, isMobile ? 3 : 0), type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'kb', label: 'Dojo', ...getPos(isMobile ? 1 : 2, isMobile ? 3 : 1), type: 'BOOK' },
            { id: 'timer', label: 'Sprint', ...getPos(isMobile ? 2 : 2, isMobile ? 3 : 2), type: 'TIMER' },
            { id: 'char_sheet', label: 'Hero Architect', ...getPos(isMobile ? 0 : 2, isMobile ? 4 : 3), type: 'SHEET' },
            
            // Trash is special
            { id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' }, 
        ] as IconData[];
    };

    const [icons, setIcons] = useState<IconData[]>([]);

    // Initialize on mount to ensure window is available
    useEffect(() => {
        setIcons(calculateGrid());
    }, []);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIcons(prevIcons => {
                    const newLayout = calculateGrid();
                    // Preserve user-dragged positions if they differ significantly? 
                    // For now, snap back to grid on resize to keep it clean for XR/Mobile rotation.
                    return newLayout.map(newIcon => {
                        // Optional: Check if icon was manually moved. 
                        // For simplicity in this demo, we re-flow the grid.
                        return newIcon;
                    });
                });
            }, 200);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const updateIconPos = useCallback((id: string, x: number, y: number) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, x, y } : icon));
    }, []);

    return { icons, setIcons, updateIconPos };
};
