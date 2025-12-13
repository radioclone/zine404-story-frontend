
import { useState, useEffect, useCallback } from 'react';
import { IconData } from '../types';

export const useDesktopGrid = () => {
    const getInitialIcons = (): IconData[] => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w < 768;
        const isTablet = w >= 768 && w < 1024;
        
        // Tighter packing for mobile
        const colStride = isMobile ? 85 : (isTablet ? 120 : 160);
        const rowStride = isMobile ? 100 : (isTablet ? 140 : 180);
        const startX = isMobile ? 16 : 40;
        const startY = isMobile ? 80 : 100;

        const trashX = w - (isMobile ? 80 : 180);
        const trashY = h - (isMobile ? 120 : 180);

        return [
            // Column 1
            { id: 'node', label: 'Story Network', x: startX, y: startY, type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', x: startX, y: startY + rowStride, type: 'APP' },
            { id: 'manifesto', label: 'Manifesto.txt', x: startX, y: startY + (rowStride * 2), type: 'FILE' },

            // Column 2
            { id: 'ao_terminal', label: 'AO Hyperbeam', x: startX + colStride, y: startY, type: 'ARWEAVE' },
            { id: 'bazar', label: 'Bazar Mkt', x: startX + colStride, y: startY + rowStride, type: 'MARKET' },
            { id: 'draft', label: 'Draft_v1.txt', x: startX + colStride, y: startY + (rowStride * 2), type: 'FILE' },

            // Column 3
            { id: 'music', label: 'Music', x: startX + (colStride * 2), y: startY, type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'kb', label: 'Dojo', x: startX + (colStride * 2), y: startY + rowStride, type: 'BOOK' },
            { id: 'timer', label: 'Sprint', x: startX + (colStride * 2), y: startY + (rowStride * 2), type: 'TIMER' },
            { id: 'char_sheet', label: 'Hero Architect', x: startX + (colStride * 2), y: startY + (rowStride * 3), type: 'SHEET' },
            
            // Bottom Right
            { id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' }, 
        ];
    };

    const [icons, setIcons] = useState<IconData[]>(getInitialIcons());

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 768;
            
            const trashX = w - (isMobile ? 80 : 180);
            const trashY = h - (isMobile ? 120 : 180);

            setIcons(prev => prev.map(icon => 
                icon.id === 'trash' 
                    ? { ...icon, x: trashX, y: trashY } 
                    : icon
            ));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateIconPos = useCallback((id: string, x: number, y: number) => {
        setIcons(prev => prev.map(icon => icon.id === id ? { ...icon, x, y } : icon));
    }, []);

    return { icons, setIcons, updateIconPos };
};
