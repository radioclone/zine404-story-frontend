
import React, { useState } from 'react';
import WindowFrame from './WindowFrame';

interface KnowledgeBaseProps {
    onClose: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onClose }) => {
    const activeModuleRef = React.useRef<string | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);

    const modules = [
        {
            id: 'cinematic-gameplay',
            title: 'Cinematic Gameplay (2025)',
            description: 'How to turn D&D sessions into streaming IP assets.',
            content: `THE "NETFLIX" CAMPAIGN MODEL
------------------------------
In the modern era, a D&D session is more than a game. It is a "Writer's Room" for your next show.

1. SESSION ZERO (The Pilot)
   - Use StoryOS to define your "Series Bible."
   - Agree on Tone (e.g., Stranger Things vs. Game of Thrones).
   - Define the Cast (Player Characters) as IP Assets.

2. THE "DIRECTOR" AI
   - Enable the [DIRECTOR] mode in Muze.
   - The AI will listen to your gameplay and suggest:
     * Camera Angles ("Dutch angle on the rogue...")
     * Lighting Cues ("Neon-noir reflections...")
     * SFX ("The hum of the mana-drive...")

3. MINTING THE EPISODE
   - When a session ends, click "MINT SEASON."
   - This registers the transcript, audio, and visuals to Story Protocol.
   - Your guild (party) now owns the on-chain rights to that episode.

4. COMMUNITY COLLABORATION
   - Token-gate your "Season" to allow fans to vote on plot twists.
   - Let other guilds "Remix" your villains or settings.
`
        },
        {
            id: 'structure',
            title: 'Structure 101: The Paradigm',
            description: 'Master the 3-Act Structure inspired by Syd Field.',
            content: `ACT I: SETUP (Pages 1-30)
--------------------------
- The Setup: Introduce hero, world, and status quo.
- Inciting Incident (p. 10-15): The event that changes everything.
- Plot Point 1 (p. 25-30): The hero decides to act. Crossing the threshold.

ACT II: CONFRONTATION (Pages 30-90)
-----------------------------------
- The Middle: Rising action, obstacles, and the midpoint (p. 60).
- Midpoint: A major shift in the hero's understanding or stakes.
- Pinch Points: Reminders of the antagonist's power.
- Plot Point 2 (p. 85-90): The "All is Lost" moment. The hero finds the solution.

ACT III: RESOLUTION (Pages 90-120)
----------------------------------
- The Climax: The final battle. Hero succeeds or fails.
- The Resolution: New status quo established.
`
        },
        {
            id: 'format-basics',
            title: 'Format: The Basics',
            description: 'Title pages, Sluglines, and Action descriptions.',
            content: `TITLE PAGE
----------
- Contact address in bottom left corner only.
- No draft dates or numbers for spec scripts.
- "SCREENPLAY FORMAT" by [Name] centered.

FADE IN:
Starts the script.

SCENE HEADINGS (SLUGLINES)
--------------------------
Format: [INT./EXT.] [LOCATION] - [DAY/NIGHT]
Example: EXT. LOCATION #1 - DAY

- Always typed in CAPITALS.
- Indicates: Interior/Exterior, Location, Time.

SCENE ACTION
------------
- Double-spaced under heading.
- Present tense, active verbs.
- Max 4-5 lines per paragraph (a "beat" of action).
- No novelistic thoughts or backstory; only what is seen/heard.

Example:
Joe WALKS into the room. He spots the gun on the table.
`
        },
        {
            id: 'format-dialogue',
            title: 'Format: Dialogue & Characters',
            description: 'Cues, Parentheticals, V.O., and Simultaneous speech.',
            content: `CHARACTER CUES
--------------
- Centered (indented ~middle of page), ALL CAPS.
- Consistent naming throughout (e.g. don't switch from "Joe" to "Mr. Smith").

DIALOGUE
--------
- Centered under character name.
- No centering of text block itself (formatting software handles margins).

PARENTHETICALS
--------------
- Lower case, in brackets, on separate line.
- Use sparingly for action within dialogue: (beat), (pause), (wiping sweat).
- Never leave hanging at bottom of page.

PAGE BREAKS
-----------
- (MORE) centered at bottom of page if dialogue splits.
- CHARACTER NAME (CONT'D) at top of next page.

OFF SCREEN (O.S.) vs VOICE OVER (V.O.)
--------------------------------------
- (O.S.): Character is physically present but not visible (e.g., in next room).
- (V.O.): Character not in scene (telephone, radio, narrator).
- Appears next to character name. 
  Example: CHARACTER #1 (O.S.)

SIMULTANEOUS DIALOGUE
---------------------
- Two columns side-by-side.
- Used sparingly for overlapping speech or interruptions.
`
        },
        {
            id: 'format-advanced',
            title: 'Format: Advanced Techniques',
            description: 'Montages, Flashbacks, Text, and Transitions.',
            content: `FOREIGN LANGUAGE
----------------
Method 1 (Parenthetical):
   CHARACTER #1
   (in French)
   Bonjour.

Method 2 (Subtitles):
   CHARACTER #2
   (in Russian; English subtitles)
   [Write the English dialogue here]

INTERCUTS (PHONE CONVERSATIONS)
-------------------------------
Use "INTERCUT - INT. LOC A / INT. LOC B" to avoid repeated headers.
Allows fluid switching between two characters on phones without new sluglines.

TRANSITIONS
-----------
- CUT TO: (Default, usually implied).
- DISSOLVE TO: (Right aligned).
- FADE TO: (Used before new Act or major shift).
- FADE OUT. (End of script).
*Avoid transitions in spec scripts unless absolutely necessary.*

SERIES OF SHOTS / MONTAGE
-------------------------
A) SERIES OF SHOTS: Rapid narrative sequence.
B) MONTAGE: Blending images for effect/passage of time.
- Useful to avoid multiple scene headings for very short shots.

ON-SCREEN TEXT
--------------
- Format signs in body action: "THIS IS A SIGN"
- Letters/Emails: Format like dialogue in quotes.

FLASHBACKS
----------
- Header: EXT. LOCATION - NIGHT - 1956, FLASHBACK
- End with: END FLASHBACK.
`
        }
    ];

    return (
        <WindowFrame title="Screenwriting Dojo" onClose={onClose}>
            <div className="flex w-full h-full">
                {/* Sidebar Navigation */}
                <div className="w-1/3 border-r border-white/10 p-6 flex flex-col gap-4 bg-white/[0.02]">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Knowledge Base</h2>
                        <p className="text-white/40 text-sm font-mono mt-2">Training Data for Humans.</p>
                    </div>
                    
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => setActiveModule(mod.id)}
                            className={`
                                text-left p-4 rounded-xl border transition-all duration-300 group
                                ${activeModule === mod.id 
                                    ? 'bg-[#F7931A]/20 border-[#F7931A]/50 shadow-[0_0_20px_rgba(247,147,26,0.1)]' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <h3 className={`font-bold mb-1 ${activeModule === mod.id ? 'text-[#F7931A]' : 'text-white group-hover:text-white'}`}>
                                {mod.title}
                            </h3>
                            <p className="text-xs text-white/50 leading-relaxed font-mono">
                                {mod.description}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/20">
                    {activeModule ? (
                        <div className="animate-scale-in">
                            <h2 className="text-3xl font-light text-white mb-6">
                                {modules.find(m => m.id === activeModule)?.title}
                            </h2>
                            <div className="bg-[#1c1c1e] p-8 rounded-2xl border border-white/10 font-mono text-sm leading-loose text-white/80 whitespace-pre-wrap shadow-inner">
                                {modules.find(m => m.id === activeModule)?.content}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
                            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                                <span className="text-4xl">🎓</span>
                            </div>
                            <p className="font-mono text-sm">Select a module to begin training.</p>
                        </div>
                    )}
                </div>
            </div>
        </WindowFrame>
    );
};

export default KnowledgeBase;
