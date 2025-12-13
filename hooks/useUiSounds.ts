
import { useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

export const useUiSounds = () => {
  const synth = useRef<Tone.PolySynth | null>(null);
  const clickSynth = useRef<Tone.Synth | null>(null);
  const drumSynth = useRef<Tone.MembraneSynth | null>(null);
  const ignitionSynth = useRef<Tone.Synth | null>(null);
  const demoLoop = useRef<Tone.Loop | null>(null);
  const limiter = useRef<Tone.Limiter | null>(null);
  const masterGain = useRef<Tone.Gain | null>(null);
  
  // FOCUS MODE REFS
  const focusDrone = useRef<Tone.PolySynth | null>(null);
  const focusLoop = useRef<Tone.Loop | null>(null);
  
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);

  // Bill Evans Voicings (Rootless II-V-I)
  const voicings = [
    ["F3", "C4", "E4", "A4"], // Dm9
    ["F3", "B3", "E4", "Ab4"], // G13b9
    ["E3", "B3", "D4", "G4"]  // Cmaj9
  ];

  const dispose = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    if (synth.current) { synth.current.releaseAll(); synth.current.dispose(); synth.current = null; }
    if (clickSynth.current) { clickSynth.current.dispose(); clickSynth.current = null; }
    if (drumSynth.current) { drumSynth.current.dispose(); drumSynth.current = null; }
    if (ignitionSynth.current) { ignitionSynth.current.dispose(); ignitionSynth.current = null; }
    if (demoLoop.current) { demoLoop.current.dispose(); demoLoop.current = null; }
    
    // Focus Cleanup
    if (focusDrone.current) { focusDrone.current.releaseAll(); focusDrone.current.dispose(); focusDrone.current = null; }
    if (focusLoop.current) { focusLoop.current.dispose(); focusLoop.current = null; }

    if (masterGain.current) { masterGain.current.dispose(); masterGain.current = null; }
    if (limiter.current) { limiter.current.dispose(); limiter.current = null; }
    
    isInitialized.current = false;
    isInitializing.current = false;
  }, []);

  const initAudio = useCallback(async () => {
    if (isInitialized.current) {
        if (Tone.context.state !== 'running') {
            try { await Tone.context.resume(); } catch(e) { console.warn(e); }
        }
        return;
    }
    
    if (isInitializing.current) return;
    isInitializing.current = true;
    
    await Tone.start();
    await Tone.context.resume();

    // If disposed while awaiting
    if (!isInitializing.current) return;

    // --- GAIN STAGING & SIGNAL CHAIN ---
    limiter.current = new Tone.Limiter(-1).toDestination(); 
    masterGain.current = new Tone.Gain(0.8).connect(limiter.current);
    
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).connect(masterGain.current);
    await reverb.generate();

    // 1. CHORD SYNTH (The Jazz Engine)
    synth.current = new Tone.PolySynth(Tone.FMSynth, {
      maxPolyphony: 4, 
      volume: -12, 
      voice: Tone.FMSynth,
      oscillator: { type: "sine" },
      modulation: { type: "triangle" },
      modulationIndex: 2,
      harmonicity: 1,
      envelope: {
        attack: 0.02, 
        decay: 0.3,
        sustain: 0.1,
        release: 0.3 
      }
    }).connect(reverb);
    
    // 2. CLICK SYNTH (UI Feedback)
    const clickFilter = new Tone.Filter(4000, "lowpass").connect(reverb);
    clickSynth.current = new Tone.Synth({
      volume: -10, 
      oscillator: { type: "square" }, 
      envelope: {
        attack: 0.002, 
        decay: 0.05, 
        sustain: 0,    
        release: 0.05,
      }
    }).connect(clickFilter);

    // 3. IGNITION SYNTH
    ignitionSynth.current = new Tone.Synth({
        volume: -8,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 1.5, sustain: 0, release: 1 }
    }).connect(reverb); 

    // 4. DRUM SYNTH
    drumSynth.current = new Tone.MembraneSynth({
        volume: -15
    }).connect(masterGain.current); 
    
    // 5. FOCUS DRONE (Ambient Generator)
    // Uses FatOscillator for width + Lowpass filter for softness
    const focusFilter = new Tone.Filter(800, "lowpass").connect(reverb);
    const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(focusFilter).start();
    focusDrone.current = new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 6,
        volume: -20,
        oscillator: { type: "fatcustom", partials: [0.2, 1, 0, 0.5, 0.1], spread: 40, count: 3 },
        envelope: { attack: 2, decay: 1, sustain: 1, release: 4 }
    }).connect(chorus);

    // 5. SEQUENCER
    demoLoop.current = new Tone.Loop((time) => {
        if (!drumSynth.current || drumSynth.current.disposed) return;
        if (!synth.current || synth.current.disposed) return;

        // Kick
        drumSynth.current.triggerAttackRelease("C1", "8n", time);
        drumSynth.current.triggerAttackRelease("C1", "8n", time + 0.5); 
        
        // Comping
        if (Math.random() > 0.6) {
             const chord = voicings[Math.floor(Math.random() * voicings.length)];
             synth.current.triggerAttackRelease(chord, "16n", time + 0.25, 0.3);
        }
    }, "1n").start(0);

    Tone.Transport.bpm.value = 96;
    isInitialized.current = true;
    isInitializing.current = false;
  }, []);

  const playIgnition = useCallback(async () => {
    await initAudio();
    if (ignitionSynth.current && !ignitionSynth.current.disposed) {
        ignitionSynth.current.triggerAttackRelease("C2", 2);
    }
    if (synth.current && !synth.current.disposed) {
        synth.current.triggerAttackRelease(["C3", "G3", "C4", "E4"], 1.5);
    }
  }, [initAudio]);

  const playHover = useCallback(async (index: number = 0) => {
    // Attempt to wake context if suspended (e.g. tab switch)
    if (Tone.context.state === 'suspended') {
        try { await Tone.context.resume(); } catch(e) {}
    }
    
    if (Tone.context.state !== 'running') return;
    
    if (synth.current && !synth.current.disposed) {
      const chord = voicings[index % voicings.length];
      synth.current.triggerAttackRelease(chord, "8n", undefined, 0.15);
    }
  }, []);

  const playClick = useCallback(async () => {
    if (Tone.context.state !== 'running') {
         try { await Tone.context.resume(); } catch(e) {}
    }
    if (!isInitialized.current) await initAudio();
    
    if (clickSynth.current && !clickSynth.current.disposed) {
        const note = Math.random() > 0.5 ? "G5" : "E5";
        clickSynth.current.triggerAttackRelease(note, "32n", undefined, 0.3);
    }
  }, [initAudio]);

  const playDemoTrack = useCallback(async () => {
    if (Tone.context.state !== 'running') {
        try { await Tone.context.resume(); } catch(e) {}
    }
    if (!isInitialized.current) await initAudio();
    
    if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
    } else {
        Tone.Transport.start();
    }
  }, [initAudio]);
  
  const toggleFocusMusic = useCallback(async (shouldPlay: boolean) => {
      if (Tone.context.state !== 'running') {
        try { await Tone.context.resume(); } catch(e) {}
      }
      if (!isInitialized.current) await initAudio();

      // Clear existing focus loop
      if (focusLoop.current) {
          focusLoop.current.dispose();
          focusLoop.current = null;
      }
      if (focusDrone.current) {
          focusDrone.current.releaseAll();
      }

      if (shouldPlay && focusDrone.current) {
          // Generative Ambient Loop (Eno style)
          const notes = ["C3", "G3", "D4", "E4", "G4", "B4"];
          focusLoop.current = new Tone.Loop((time) => {
              if (Math.random() > 0.4) {
                  const note = notes[Math.floor(Math.random() * notes.length)];
                  const dur = Math.random() * 4 + 2;
                  focusDrone.current?.triggerAttackRelease(note, dur, time);
              }
          }, "2n").start(0);
          
          Tone.Transport.start();
      } else {
          // If we are stopping focus but not playing demo, stop transport
          if (Tone.Transport.state === 'started' && !demoLoop.current?.state) {
              Tone.Transport.stop();
          }
      }
  }, [initAudio]);

  // Cleanup
  useEffect(() => {
    return () => dispose();
  }, [dispose]);

  return { playHover, playClick, initAudio, playDemoTrack, playIgnition, toggleFocusMusic };
};
