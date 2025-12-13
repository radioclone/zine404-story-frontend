
import React from 'react';

// Authentic 24x24 grid pixel art constructed with <rect> for sharp edges
export const PixelIcons = {
    StoryNode: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Center Hub */}
            <rect x="10" y="10" width="4" height="4" />
            {/* Top Node */}
            <rect x="10" y="2" width="4" height="4" opacity="0.8"/>
            <rect x="11" y="6" width="2" height="4" opacity="0.4"/>
            {/* Bottom Right Node */}
            <rect x="18" y="16" width="4" height="4" opacity="0.8"/>
            <rect x="14" y="14" width="4" height="2" opacity="0.4"/>
            {/* Bottom Left Node */}
            <rect x="2" y="16" width="4" height="4" opacity="0.8"/>
            <rect x="6" y="14" width="4" height="2" opacity="0.4"/>
        </svg>
    ),
    IpLauncher: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Rocket Body */}
            <rect x="11" y="3" width="2" height="2" />
            <rect x="10" y="5" width="4" height="10" />
            
            {/* Window */}
            <rect x="11" y="7" width="2" height="2" fill="black" opacity="0.2"/>
            
            {/* Fins */}
            <rect x="8" y="11" width="2" height="4" />
            <rect x="7" y="13" width="1" height="3" />
            <rect x="14" y="11" width="2" height="4" />
            <rect x="16" y="13" width="1" height="3" />
            
            {/* Flame */}
            <rect x="11" y="16" width="2" height="3" opacity="0.6"/>
            <rect x="11" y="20" width="2" height="1" opacity="0.3"/>
        </svg>
    ),
    File: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Outline */}
            <path d="M6 2h8l6 6v14H6V2z" fill="none" stroke={color} strokeWidth="2" />
            {/* Dog ear */}
            <rect x="14" y="2" width="2" height="6" />
            <rect x="14" y="8" width="6" height="2" />
            {/* Lines */}
            <rect x="9" y="12" width="6" height="2" opacity="0.5"/>
            <rect x="9" y="16" width="6" height="2" opacity="0.5"/>
        </svg>
    ),
    Trash: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Lid */}
            <rect x="6" y="4" width="12" height="2" />
            <rect x="10" y="2" width="4" height="2" />
            {/* Bin Body */}
            <rect x="7" y="7" width="10" height="14" opacity="0.8"/>
            {/* Stripes */}
            <rect x="9" y="9" width="2" height="10" fill="black" opacity="0.3"/>
            <rect x="13" y="9" width="2" height="10" fill="black" opacity="0.3"/>
        </svg>
    ),
    Folder: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Back Tab */}
            <rect x="2" y="4" width="8" height="2" opacity="0.6"/>
            <rect x="10" y="6" width="2" height="2" opacity="0.6"/>
            {/* Main Body */}
            <rect x="2" y="6" width="20" height="14" />
            {/* Shadow Detail */}
            <rect x="2" y="6" width="20" height="2" fill="black" opacity="0.1"/>
        </svg>
    ),
    Music: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
             {/* Note 1 Head */}
             <rect x="4" y="16" width="5" height="4" />
             {/* Note 1 Stem */}
             <rect x="8" y="6" width="1" height="10" />
             
             {/* Note 2 Head */}
             <rect x="15" y="14" width="5" height="4" />
             {/* Note 2 Stem */}
             <rect x="19" y="4" width="1" height="10" />

             {/* Beam (Connecting the notes) */}
             <rect x="8" y="4" width="12" height="3" />
             <rect x="8" y="7" width="12" height="1" opacity="0.5"/>
        </svg>
    ),
    Shopping: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Handle Top */}
            <rect x="9" y="3" width="6" height="2" />
            {/* Handle Sides */}
            <rect x="9" y="5" width="1" height="3" />
            <rect x="14" y="5" width="1" height="3" />
            
            {/* Bag Body */}
            <rect x="6" y="8" width="12" height="13" />
            
            {/* Minimalist Detail: Clasp/Buckle */}
            <rect x="11" y="8" width="2" height="3" opacity="0.6" />
            
            {/* Bottom Shadow/Depth */}
            <rect x="6" y="19" width="12" height="2" opacity="0.2" />
        </svg>
    ),
    Timer: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Hourglass Frame */}
            <rect x="6" y="2" width="12" height="2" />
            <rect x="6" y="20" width="12" height="2" />
            <rect x="5" y="4" width="2" height="2" />
            <rect x="17" y="4" width="2" height="2" />
            <rect x="5" y="18" width="2" height="2" />
            <rect x="17" y="18" width="2" height="2" />
            {/* Glass Body */}
            <rect x="7" y="4" width="1" height="5" />
            <rect x="16" y="4" width="1" height="5" />
            <rect x="7" y="15" width="1" height="5" />
            <rect x="16" y="15" width="1" height="5" />
            <rect x="8" y="9" width="2" height="2" />
            <rect x="14" y="9" width="2" height="2" />
            <rect x="10" y="11" width="4" height="2" />
            {/* Sand */}
            <rect x="9" y="5" width="6" height="3" fill="#F7931A" opacity="0.8"/>
            <rect x="8" y="16" width="8" height="3" fill="#F7931A" opacity="0.8"/>
        </svg>
    ),
    Book: ({ className = "w-16 h-16", color = "currentColor" }: {className?: string, color?: string}) => (
        <svg className={className} viewBox="0 0 24 24" fill={color} shapeRendering="crispEdges">
            {/* Left Page */}
            <rect x="4" y="5" width="8" height="14" />
            {/* Right Page */}
            <rect x="12" y="5" width="8" height="14" opacity="0.8"/>
            {/* Spine */}
            <rect x="11" y="5" width="2" height="14" opacity="0.5"/>
            {/* Cover edges */}
            <rect x="3" y="4" width="9" height="16" opacity="0.2"/>
            <rect x="12" y="4" width="9" height="16" opacity="0.2"/>
             {/* Text Lines */}
            <rect x="6" y="8" width="4" height="1" fill="black" opacity="0.3"/>
            <rect x="6" y="10" width="4" height="1" fill="black" opacity="0.3"/>
            <rect x="14" y="8" width="4" height="1" fill="black" opacity="0.3"/>
            <rect x="14" y="10" width="4" height="1" fill="black" opacity="0.3"/>
        </svg>
    )
};
