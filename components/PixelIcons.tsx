
import React from 'react';

// MINIMALIST NINTENDO-STYLE PIXEL ART ICONS (24x24 Grid)
// Replaces abstract 3D voxels with clear, readable 8-bit glyphs.

export const PixelIcons = {
    // 1. STORY NETWORK: The Tri-Force / Network Graph
    StoryNode: ({ className = "w-full h-full", color = "#FF7E67" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Top Node */}
            <rect x="10" y="2" width="4" height="4" fill={color} />
            {/* Bottom Nodes */}
            <rect x="4" y="14" width="4" height="4" fill={color} />
            <rect x="16" y="14" width="4" height="4" fill={color} />
            {/* Connections (Dotted/Pixelated) */}
            <path d="M11 6V10H6V14H8V11H16V14H18V10H13V6H11Z" fill="white" fillOpacity="0.8" />
        </svg>
    ),

    // 2. IP LAUNCHER: The 8-Bit Rocket
    IpLauncher: ({ className = "w-full h-full", color = "white" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
             {/* Body */}
             <path d="M10 4H14V6H16V10H18V16H16V18H14V16H10V18H8V16H6V10H8V6H10V4Z" fill="white" />
             {/* Window */}
             <rect x="10" y="8" width="4" height="4" fill="#3A3A3C" />
             {/* Fins */}
             <rect x="6" y="12" width="2" height="4" fill={color} />
             <rect x="16" y="12" width="2" height="4" fill={color} />
             {/* Fire */}
             <path d="M10 20H14V22H10V20Z" fill="#F7931A" />
             <path d="M11 22H13V24H11V22Z" fill="#F7931A" fillOpacity="0.6" />
        </svg>
    ),

    // 3. TERMINAL: The Prompt
    ArweaveTerminal: ({ className = "w-full h-full", color = "#C2F970" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Screen Border */}
            <path d="M2 4H22V20H2V4ZM4 6V18H20V6H4Z" fill={color} fillOpacity="0.9" />
            {/* Screen Bg */}
            <rect x="4" y="6" width="16" height="12" fill="#111" />
            {/* Prompt >_ */}
            <path d="M6 8H8V10H10V12H8V14H6V12H8V10H6V8Z" fill={color} />
            <rect x="12" y="12" width="4" height="2" fill={color} className="animate-pulse" />
        </svg>
    ),

    // 4. FILE: Text Doc
    File: ({ className = "w-full h-full", color = "#e4e4e7" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Paper Shape */}
            <path d="M6 2H14L18 6V22H6V2Z" fill={color} />
            {/* Corner Fold */}
            <path d="M14 2V6H18" fill="rgba(0,0,0,0.2)" />
            {/* Lines (Pixelated) */}
            <rect x="8" y="10" width="8" height="2" fill="black" fillOpacity="0.3" />
            <rect x="8" y="14" width="8" height="2" fill="black" fillOpacity="0.3" />
            <rect x="8" y="18" width="6" height="2" fill="black" fillOpacity="0.3" />
        </svg>
    ),

    // 5. FOLDER: Directory
    Folder: ({ className = "w-full h-full", color = "#3b82f6" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Back Tab */}
            <path d="M2 6H10L12 8H22V20H2V6Z" fill={color} fillOpacity="0.5" />
            {/* Front Flap */}
            <path d="M2 9H22V20H2V9Z" fill={color} />
            {/* Detail */}
            <rect x="2" y="9" width="20" height="2" fill="white" fillOpacity="0.2" />
        </svg>
    ),

    // 6. TRASH: Bin
    Trash: ({ className = "w-full h-full", color = "#71717a" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Lid */}
            <rect x="6" y="4" width="12" height="2" fill={color} />
            <rect x="9" y="2" width="6" height="2" fill={color} />
            {/* Can */}
            <path d="M6 7H18V22H6V7ZM8 9V20H10V9H8ZM14 9V20H16V9H14Z" fill={color} fillOpacity="0.8" />
        </svg>
    ),

    // 7. MARKET: Coin / Bag
    Market: ({ className = "w-full h-full", color = "#F7931A" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
             {/* Bag Shape */}
             <path d="M8 8H16V20H8V8Z" fill="#9A3412" />
             <path d="M6 8H8V20H6V8Z" fill="#C2410C" />
             <path d="M16 8H18V20H16V8Z" fill="#C2410C" />
             <rect x="6" y="20" width="12" height="2" fill="#7C2D12" />
             {/* Handle */}
             <path d="M9 8V5H15V8H13V7H11V8H9Z" fill="#C2410C" />
             {/* $ Symbol */}
             <rect x="11" y="12" width="2" height="4" fill="#F7931A" />
        </svg>
    ),

    // 8. MUSIC: 8-Bit Note
    Music: ({ className = "w-full h-full", color = "#EC4899" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
             {/* Note Heads */}
             <rect x="4" y="16" width="6" height="4" fill={color} />
             <rect x="14" y="14" width="6" height="4" fill={color} />
             {/* Stems */}
             <rect x="8" y="6" width="2" height="10" fill="white" />
             <rect x="18" y="4" width="2" height="10" fill="white" />
             {/* Beam */}
             <rect x="8" y="4" width="12" height="4" fill={color} />
        </svg>
    ),

    // 9. TIMER: Hourglass
    Timer: ({ className = "w-full h-full", color = "#3b82f6" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
             <path d="M6 2H18V6L14 10V14L18 18V22H6V18L10 14V10L6 6V2Z" fill={color} fillOpacity="0.5" />
             <rect x="6" y="2" width="12" height="2" fill="white" />
             <rect x="6" y="20" width="12" height="2" fill="white" />
             {/* Sand */}
             <rect x="11" y="14" width="2" height="2" fill="#F7931A" />
             <rect x="10" y="16" width="4" height="2" fill="#F7931A" />
        </svg>
    ),

    // 10. BOOK: Spellbook
    Book: ({ className = "w-full h-full", color = "#8b5cf6" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
             <path d="M4 6H11V20H4V6Z" fill={color} />
             <path d="M13 6H20V20H13V6Z" fill={color} />
             {/* Spine */}
             <rect x="11" y="6" width="2" height="14" fill="#6d28d9" />
             {/* Text lines */}
             <rect x="6" y="8" width="3" height="2" fill="white" fillOpacity="0.4" />
             <rect x="15" y="8" width="3" height="2" fill="white" fillOpacity="0.4" />
        </svg>
    ),

    // 11. SHOPPING: Cart
    Shopping: ({ className = "w-full h-full", color = "#DB2777" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M2 4H6L9 16H19V14H9L8 10H19V6H7L6 4Z" fill={color} />
            <rect x="8" y="18" width="3" height="3" fill="white" />
            <rect x="16" y="18" width="3" height="3" fill="white" />
        </svg>
    ),

    // 12. D20: Sword & Shield (Hero)
    D20: ({ className = "w-full h-full", color = "#EF4444" }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            {/* Sword Blade */}
            <path d="M11 4H13V16H11V4Z" fill="white" />
            <path d="M11 4L12 2L13 4" fill="white" />
            {/* Guard */}
            <path d="M8 14H16V16H8V14Z" fill={color} />
            {/* Handle */}
            <rect x="11" y="16" width="2" height="4" fill="#71717a" />
            <rect x="10" y="20" width="4" height="2" fill={color} />
        </svg>
    )
};
