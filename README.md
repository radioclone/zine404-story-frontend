
# 🎬 StoryOS

> **A spatial hypercard experience. Tribute to Jaime Levy.**  
> Built with React, Tone.js, and Phaser.

![Status](https://img.shields.io/badge/Status-Alpha-orange) ![Stack](https://img.shields.io/badge/Stack-React_Phaser_Tone-blue) ![AI](https://img.shields.io/badge/AI-Gemini_Multimodal_Live-purple) ![Web3](https://img.shields.io/badge/Network-Story_Odyssey_Testnet-green)

---

## 🔮 The Vision

StoryOS is a spatial operating system designed to reclaim the creative workflow from centralized walled gardens. It pays homage to the pioneering interface design work of Jaime Levy, bringing the spirit of Mac HyperCards into the modern browser.

*   **For GMs:** An AI-powered workspace to generate lore, maps, and rules on the fly.
*   **For Players:** A sovereign character sheet where your stats and loot live in your wallet.
*   **For Creators:** Register your homebrew monsters and items as IP Assets.

---

## 🏗 System Architecture

The project is designed as a retro-futurist OS.

### 1. The Spatial Layer (UI/UX)
*   **Engine:** React 19 + Tailwind CSS.
*   **Aesthetics:** High-fidelity pixel art, CRT scanlines, and glassmorphism.
*   **Audio:** Procedural "Focus Mode" music using `Tone.js`.

### 2. The Intelligence Layer (AI Game Master)
*   **Provider:** Google Gemini Multimodal Live API.
*   **Persona:** "Muze" — currently a creative writing assistant.
*   **Real-Time:** Low-latency voice interaction for "Theatre of the Mind" gameplay.

### 3. The Sovereignty Layer (Web3)
*   **Protocol:** Story Protocol (Odyssey Testnet).
*   **Assets:** Every file (Image, Text, Audio) can be minted as a **Programmable IP Asset**.

---

## 💻 Developer Setup

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file:
    ```env
    API_KEY=your_google_gemini_api_key
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```

---

*Inspired by the works of Jaime Levy and the ethos of Cypherpunk.*