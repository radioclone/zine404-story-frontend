
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserBackgroundProps {
    active?: boolean;
}

const PhaserBackground: React.FC<PhaserBackgroundProps> = ({ active = true }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
      activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleAudio = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (gameRef.current && gameRef.current.scene.scenes[0]) {
            gameRef.current.registry.set('bass', customEvent.detail.bass);
            gameRef.current.registry.set('treble', customEvent.detail.treble);
        }
    };
    window.addEventListener('audio-reactivity', handleAudio);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      transparent: true,
      physics: { default: 'arcade' },
      scene: {
        create: create,
        update: update,
      },
    };

    let graphics: Phaser.GameObjects.Graphics;

    function create(this: Phaser.Scene) {
      graphics = this.add.graphics();
    }

    function update(this: Phaser.Scene) {
      const width = this.scale.width;
      const height = this.scale.height;
      const time = this.time.now;
      
      const isActive = activeRef.current;

      // Audio Inputs
      const bass = this.registry.get('bass') || 0;     
      const treble = this.registry.get('treble') || 0;

      graphics.clear();

      const points: {x: number, y: number}[] = [];
      const resolution = 200; 
      
      // Idle State: Very flat, calm line
      // Active State: Responsive wave
      const amplitudeBase = isActive ? 40 : 5;
      
      for (let i = 0; i <= resolution; i++) {
        const x = (i / resolution) * width;
        const normX = (i / resolution) * 2 - 1; // -1 to 1
        
        // Attenuation to keep edges pinned
        const attenuation = Math.exp(-4 * normX * normX);

        // Frequency modulation
        const carrierFreq = 0.003;
        const signal = Math.sin((i * 10) + time * carrierFreq);
        
        // Reactivity
        // Subtle damping: max bass amp contribution reduced from 250 to 200
        const bassAmp = isActive ? (bass * 200) : 0;
        const totalAmp = (amplitudeBase + bassAmp) * attenuation;
        
        const noise = isActive ? (Math.random() - 0.5) * (treble * 10) : 0;

        const y = (height / 2) + (signal * totalAmp) + noise;
        
        points.push({ x, y });
      }

      // Draw Main Wave
      // Color: Updated to #F7941D
      const alpha = isActive ? 0.8 : 0.3;
      const thickness = isActive ? 2 : 1;
      
      graphics.lineStyle(thickness, 0xF7941D, alpha);
      graphics.beginPath();
      graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
      }
      graphics.strokePath();
      
      // Glow Effect (Duplicate stroke with low alpha)
      if (isActive) {
        graphics.lineStyle(8, 0xF7941D, 0.1);
        graphics.strokePath();
      }
    }

    gameRef.current = new Phaser.Game(config);

    const handleResize = () => {
        if (gameRef.current) {
            gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('audio-reactivity', handleAudio);
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none mix-blend-screen" />;
};

export default PhaserBackground;
