
import React, { useState, useEffect } from 'react';

interface TimerWidgetProps {
    onClose: () => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ onClose }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    
    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute top-24 right-8 w-64 bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 shadow-2xl z-40 animate-scale-in flex flex-col items-center">
             <div className="flex justify-between w-full mb-4">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Sprint Timer</span>
                <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
             </div>
             
             <div className="font-mono text-5xl font-bold text-white mb-6 tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
             </div>

             <div className="flex gap-2 w-full">
                 <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-[#F7931A] text-black'}`}
                 >
                    {isActive ? 'PAUSE' : 'START'}
                 </button>
                 <button 
                    onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
                    className="px-4 py-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/20"
                 >
                    ↺
                 </button>
             </div>
        </div>
    );
};

export default TimerWidget;
