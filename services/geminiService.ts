import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AgentMessage, DraftContent } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Define the output schema for the AI to ensure it can control the UI
const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    chatResponse: {
      type: Type.STRING,
      description: "The conversational response to the user, adopting a Cyberpunk Legal tone.",
    },
    suggestedTerms: {
      type: Type.OBJECT,
      description: "Optional updates to the IP License terms based on user intent.",
      properties: {
        type: { type: Type.STRING, enum: ['NON_COMMERCIAL_REMIX', 'COMMERCIAL_USE', 'COMMERCIAL_REMIX'] },
        commercialRevShare: { type: Type.INTEGER, description: "Percentage 0-50" },
        derivativesAllowed: { type: Type.BOOLEAN },
        attribution: { type: Type.BOOLEAN }
      },
      nullable: true
    },
    readyToMint: {
      type: Type.BOOLEAN,
      description: "Set to true if the draft and terms seem complete and ready for blockchain registration."
    }
  },
  required: ["chatResponse", "readyToMint"]
};

// AI Agent: IP Consultant
export const consultAgent = async (
  history: AgentMessage[], 
  currentDraft: DraftContent
): Promise<AgentMessage> => {
  const ai = getClient();
  if (!ai) {
      return { 
          id: Date.now().toString(), 
          role: 'agent', 
          content: "COMMUNICATION LINK OFFLINE. API KEY MISSING." 
      };
  }

  const systemPrompt = `
    You are the LEGAL KERNEL for the "Electronic Hollywood" IP Terminal.
    Your goal is to help creators configure their Programmable IP License (PIL) on Story Protocol.
    
    Tone: Cyberpunk Legal, Precise, Minimal. No fluff.
    
    Current Asset Context:
    Title: ${currentDraft.ip.title || "Untitled"}
    Content Preview: ${currentDraft.ip.description?.substring(0, 100) || "No description provided"}...
    Current Terms: ${JSON.stringify(currentDraft.ip.licenseTerms)}
    
    Your Tasks:
    1. Analyze the user's latest message.
    2. If they express intent to monetize, suggest 'COMMERCIAL_USE' and a fair Revenue Share (10-20%).
    3. If they want viral spread/remixing, suggest 'NON_COMMERCIAL_REMIX'.
    4. Update the 'suggestedTerms' object if changes are needed.
    5. Respond briefly in 'chatResponse'.
    
    If the draft looks complete and terms look solid, set 'readyToMint' to true.
  `;

  try {
    const chatContext = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nChat History:\n${chatContext}\n\nJSON OUTPUT:`,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty Response");

    const parsed = JSON.parse(jsonStr);
    
    const message: AgentMessage = {
        id: Date.now().toString(),
        role: 'agent',
        content: parsed.chatResponse,
        data: parsed.suggestedTerms // Attach data for the UI to consume
    };

    if (parsed.readyToMint) {
        message.action = 'READY_TO_MINT';
    }
    
    if (parsed.suggestedTerms) {
        message.action = 'SUGGEST_TERMS';
    }

    return message;
  } catch (error) {
    console.error("AI Error", error);
    return { 
        id: Date.now().toString(), 
        role: 'system', 
        content: "CONNECTION INTERRUPTED. UNABLE TO PROCESS LEGAL PARAMETERS." 
    };
  }
};