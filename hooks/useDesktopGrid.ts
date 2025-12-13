
import { useState, useEffect, useCallback } from 'react';
import { IconData } from '../types';

export const useDesktopGrid = () => {
    const getInitialIcons = (): IconData[] => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w < 768;
        const isTablet = w >= 768 && w < 1024;
        
        // Adjust grid strides based on icon size
        const colStride = isMobile ? 100 : (isTablet ? 180 : 240);
        const rowStride = isMobile ? 120 : (isTablet ? 180 : 240);
        const startX = isMobile ? 20 : 60;
        const startY = 120;

        const trashX = w - (isMobile ? 100 : 250);
        const trashY = h - (isMobile ? 160 : 250);

        return [
            { id: 'node', label: 'Story Network', x: startX, y: startY, type: 'NODE' },
            { id: 'launcher', label: 'IP Launcher', x: startX, y: startY + rowStride, type: 'APP' },
            
            { id: 'manifesto', label: 'Manifesto.txt', x: startX + colStride, y: startY, type: 'FILE' },
            { id: 'draft', label: 'Idea_State_v1.txt', x: startX + colStride, y: startY + rowStride, type: 'FILE' },
            
            { id: 'music', label: 'Rcade', x: startX + (colStride * 2), y: startY, type: 'MUSIC', url: 'https://rcade.co/' },
            { id: 'timer', label: 'Sprint', x: startX + (colStride * 2), y: startY + rowStride, type: 'TIMER' },
            
            { id: 'shopping', label: 'Shopping', x: startX + (colStride * 3), y: startY, type: 'SHOPPING', url: 'https://ip.world/' },
            { id: 'kb', label: 'Dojo', x: startX + (colStride * 3), y: startY + rowStride, type: 'BOOK' },
            
            { id: 'trash', label: 'Burn', x: trashX, y: trashY, type: 'TRASH' }, 
        ];
    };

    const [icons, setIcons] = useState<IconData[]>(getInitialIcons());

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 768;
            
            const trashX = w - (isMobile ? 100 : 250);
            const trashY = h - (isMobile ? 160 : 250);

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
