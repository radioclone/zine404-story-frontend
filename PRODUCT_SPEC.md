
# 📄 Product Requirements Document (PRD): StoryOS (The Sovereign VTT)

**Version:** 1.1 (Pivoted to VTT)  
**Status:** Alpha  
**Vision:** "Roll20 meets Story Protocol" — An AI-native Virtual Tabletop where every pixel is owned.

---

## 1. Executive Summary
**StoryOS** is a spatial operating system designed to reclaim the creative workflow from centralized walled gardens. While initially a writer's tool, its ultimate form is a **Decentralized Virtual Tabletop (VTT)**.

It combines a retro-futurist aesthetic (Hypercard x Cyberpunk) with an AI Game Master and on-chain IP registration. It is the operating system for the "Finding Nakamoto" alternate reality game (ARG).

---

## 2. Core Value Proposition
1.  **The "Sovereign" Character Sheet:** Unlike Roll20 or D&D Beyond, your character stats, lore, and inventory are yours. They are registered IP assets that travel with you across campaigns.
2.  **AI Game Master (The Muse):** An always-available GM that can generate maps, narrate outcomes, and adjudicate rules in real-time using Gemini Multimodal Live.
3.  **Themeable Interface:** A robust skinning system allowing the OS to morph from "Cyberpunk Terminal" to "Eldritch Tome" depending on the game genre.

---

## 3. User Personas
*   **The Game Master (GM):** Needs tools to organize lore, generate NPCs on the fly, and manage player disputes.
*   **The Homebrew Creator:** Creates custom classes, items, or monsters and wants to license them to other GMs via Story Protocol.
*   **The Player:** Wants a beautiful, immersive interface to play "Finding Nakamoto" and track their loot on Bitcoin/Stacks.

---

## 4. Feature Scope

### Phase 1: The Creative Shell (Current Alpha)
*   **Spatial UI:** Draggable icons, glass-morphism windows.
*   **Writer's Room:** Simple text editor for lore/campaign notes.
*   **Gemini Live Agent:** The "Muse" (Pre-cursor to the AI GM).
*   **IP Launcher:** Registering text/images as IP Assets on Story Protocol (Odyssey Testnet).

### Phase 2: The Virtual Tabletop (The Roll20 Killer)
*   **Asset-First Architecture:** Every map token and character portrait is an NFT/IP Asset.
*   **The "Table" View:**
    *   Currently powered by Phaser (2D Audio-reactive backgrounds).
    *   Upgrade to support grid-based token movement.
*   **Dice Engine:**
    *   3D Dice rolling physics (React Three Fiber or Phaser).
    *   On-chain verifiable randomness (VRF) for high-stakes rolls via Stacks/Bitcoin.

### Phase 3: The Hybrid Engine (Godot Integration)
*   **Why Godot?** For high-fidelity 3D map rendering and complex physics that browser DOM cannot handle efficiently.
*   **Architecture:**
    *   **React Layer:** Handles Wallet connection, IP Registration, Chat, and Character Sheets (The "HUD").
    *   **Godot Layer (WASM):** Embedded inside the React `SpatialShell`. Handles the 3D game world, fog of war, and dynamic lighting.
    *   **Bridge:** Two-way communication between React (UI) and Godot (Game) to sync state.

### Phase 4: The Marketplace (Bazar)
*   **Module Store:** Buy entire campaigns ("Modules") where every NPC and map is a licensed remix of the original creator's IP.
*   **Skin Store:** Buy UI themes (CSS/Asset packs) to reskin StoryOS.

---

## 5. Roadmap

| Horizon | Deliverable | Technologies |
| :--- | :--- | :--- |
| **Now** | **StoryOS Alpha** | React, Gemini Live, Story Protocol |
| **Next** | **VTT Primitives** | Multiplayer (PartyKit/WebRTC), Shared Dice Rolls |
| **Q3 2025** | **"Finding Nakamoto" Campaign** | First playable campaign using the OS |
| **Q4 2025** | **Godot Web Export** | Embedding the 3D Map View |
| **2026+** | **The Verse** | Full federation of decentralized VTT servers |

---

## 6. Technical Stack Evolution

### Current (Web Native)
*   **Framework:** React 19 + Tailwind
*   **State:** Local React State
*   **Graphics:** Phaser (2D)
*   **AI:** Gemini API

### Future (Hybrid VTT)
*   **Framework:** React (Overlay) + Godot (Canvas)
*   **State:** Replicache or PartyKit (Real-time Multiplayer Sync)
*   **Graphics:** Godot 4 (Vulkan/WebGL2)
*   **AI:** Local LLMs (WebGPU) + Cloud Fallback

---

## 7. Design System & Aesthetics
*   **Philosophy:** "Diegetic UI". The interface should feel like a device *inside* the game world.
*   **Inspirations:**
    *   *Macintosh System 7* (The structure)
    *   *Cyberpunk 2077 / Ghost in the Shell* (The motion & glitch effects)
    *   *Dungeons & Dragons 2e Books* (The typography & layout density)
*   **Skins:**
    1.  **Terminal (Default):** Monospace, Amber/Green glow, Scanlines.
    2.  **Grimoire:** Parchment textures, Serif fonts, Ink blot effects.
    3.  **LCARS:** Sci-Fi geometric layout, flat colors.
