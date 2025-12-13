
# 🛠️ Technical Architecture

## 1. System Overview
*   **Type:** Single Page Application (React 19).
*   **Paradigm:** Spatial Desktop Interface.
*   **State:** React Context + Custom Hooks.
*   **Network:** Story Protocol Odyssey Testnet.
*   **Intelligence:** Google Gemini Multimodal Live API.

---

## 2. Modularity & File Structure

### Components (`/components`)
*   **Presentation Layer:** Pure UI elements with minimal logic.
*   `SpatialShell`: Renders CRT effects, noise overlays, and background gradients.
*   `DraggableIcon`: Handles desktop icon physics and collision detection.
*   `WriterRoom`: Main editor interface; consumes `useLiveAgent`.
*   `IpLauncher`: Wizard form for blockchain transactions; consumes `useStoryProtocol`.

### Hooks (`/hooks`)
*   **Logic Layer:** Encapsulates business logic and side effects.
*   `useLiveAgent`: Manages WebSocket connections to Gemini Live.
*   `useStoryProtocol`: Wraps `@story-protocol/core-sdk` for transaction handling.
*   `useAudioStream`: Handles raw PCM audio encoding/decoding for AI voice.
*   `useUiSounds`: Procedural audio generation using `Tone.js`.
*   `useWallet`: Manages Viem/Wagmi connections to Odyssey Testnet.

### Services (`/services`)
*   **Stateless Layer:** Pure functions for external API calls.
*   `geminiService`: Handles REST-based text generation (JSON mode) for legal analysis.

---

## 3. AI Integration Strategy

### Narrative Engine (Voice)
*   **Module:** `hooks/useLiveAgent.ts`
*   **Model:** `gemini-2.5-flash-native-audio-preview-09-2025`
*   **Transport:** WebSocket (Real-time).
*   **Modality:** Audio-In / Audio-Out.
*   **Tools:**
    *   `suggest_edit`: Appends text to the active document.
    *   `roll_dice`: Generates random number outcomes for simulation.

### Legal Kernel (Analysis)
*   **Module:** `services/geminiService.ts`
*   **Model:** `gemini-2.5-flash`
*   **Transport:** REST (Request/Response).
*   **Modality:** Text-In / JSON-Out.
*   **Function:** Maps natural language descriptions to Story Protocol License terms.

---

## 4. Protocol Layer

### Sovereignty
*   **SDK:** `@story-protocol/core-sdk`.
*   **Chain:** Story Odyssey Testnet (Chain ID 1516).
*   **Authentication:** `viem` + `CoinbaseWalletSDK`.

### Transaction Flow
1.  **Metadata:** Application compiles `IpMetadata` (Title, Description, Type).
2.  **Licensing:** User selects terms (Commercial/Social); mapped to PIL standard.
3.  **Execution:** `client.ipAsset.mintAndRegisterIp` bundles minting and registration.
4.  **Confirmation:** Returns `ipId` (on-chain asset identifier).

---

## 5. Audio/Visual Engine

### Audio (`Tone.js`)
*   **Generative Music:** `PolySynth` triggers rootless jazz voicings on interaction.
*   **UI Feedback:** `MembraneSynth` and `Filter` create tactile click/hover sounds.
*   **Focus Mode:** Procedural ambient drone generation.

### Visuals (`Phaser`)
*   **Canvas:** Renders below the React DOM layer.
*   **Reactivity:** `useAudioInput` analyzes Mic frequency data.
*   **Render:** Draws sine waves modulated by bass/treble input in real-time.
