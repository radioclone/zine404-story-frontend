
import { useState, useEffect, useCallback } from 'react';
import { IconData } from '../types';

export const useDesktopGrid = () => {
    const calculateGrid = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Responsive Constants
        const isMobile = w < 640;
        const isTablet = w >= 640 && w < 1024;
        
        // Grid Configuration
        // Mobile: 2 Columns (Wider breathing room)
        // Tablet: 4 Columns
        // Desktop: Vertical Flow (Standard)
        
        let startX = 40;
        let startY = 120;
        let colStride = 120;
        let rowStride = 130;

        if (isMobile) {
            startX = 30;
            startY = 100;
            colStride = 160; // Much wider spacing for 2 cols
            rowStride = 120; // Tighter vertical packing
        } else if (isTablet) {
            startX = 40;
            startY = 120;
            colStride = 140;
            rowStride = 150;
        } else {
            startX = 50;
            startY = 140;
            colStride = 140; 
            rowStride = 160;
        }
        
        // Trash Position (Bottom Right)
        const trashX = w - (isMobile ? 80 : 120);
        const trashY = h - (isMobile ? 110 : 140);

        const getPos = (col: number, row: number) => ({
            x: startX + (col * colStride),
            y: startY + (row * rowStride)
        });

        // Icon List
        const iconDefs = [
            { id: 'node', label: 'Story Network', type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', type: 'APP' },
            { id: 'manifesto', label: 'Manifesto.txt', type: 'FILE' },
            { id: 'ao_terminal', label: 'AO Hyperbeam', type: 'ARWEAVE' },
            { id: 'bazar', label: 'Bazar Mkt', type: 'MARKET' },
            { id: 'draft', label: 'Draft_v1.txt', type: 'FILE' },
            { id: 'music', label: 'Music', type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'kb', label: 'Dojo', type: 'BOOK' },
            { id: 'timer', label: 'Sprint', type: 'TIMER' },
            { id: 'char_sheet', label: 'Hero Architect', type: 'SHEET' },
        ];

        // Layout Engine
        const gridItems: IconData[] = [];
        const itemsPerRow = isMobile ? 2 : (isTablet ? 4 : 2); // Desktop uses 2-col vertical flow on left usually

        if (isMobile) {
            // Mobile: Simple 2-column Grid
            iconDefs.forEach((icon, index) => {
                const col = index % 2;
                const row = Math.floor(index / 2);
                gridItems.push({ ...icon, ...getPos(col, row) } as IconData);
            });
        } else {
            // Desktop/Tablet: Fill Column 1, then Column 2, etc. (Vertical Flow)
            // Or Simple Grid. Let's stick to Grid for consistency.
            // Desktop: 3 Columns max on left side
            const maxRows = Math.floor((h - startY - 100) / rowStride);
            const actualMaxRows = Math.max(3, maxRows); // Ensure at least 3 rows
            
            iconDefs.forEach((icon, index) => {
                const col = Math.floor(index / actualMaxRows);
                const row = index % actualMaxRows;
                gridItems.push({ ...icon, ...getPos(col, row) } as IconData);
            });
        }
            
        // Add Trash
        gridItems.push({ id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' });

        return gridItems;
    };

    const [icons, setIcons] = useState<IconData[]>([]);

    useEffect(() => {
        setIcons(calculateGrid());
    }, []);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIcons(calculateGrid());
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
