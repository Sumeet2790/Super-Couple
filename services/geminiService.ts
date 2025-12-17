import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quest, DateIdea } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

// --- Quest Generation ---

export const generateDailyQuest = async (partner1: string, partner2: string, mood: string = 'balanced'): Promise<Omit<Quest, 'id' | 'isCompleted' | 'dateGenerated'>> => {
  const systemInstruction = `You are a relationship coach for a couple named ${partner1} and ${partner2}. Generate a single daily quest for them to do together today. It should be simple, achievable in under 30 minutes, and focus on connection.`;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the quest" },
      description: { type: Type.STRING, description: "A short, engaging description of what to do." },
      type: { type: Type.STRING, enum: ['fun', 'deep', 'romantic', 'adventurous'] },
      xpReward: { type: Type.INTEGER, description: "Points for completing, between 10 and 50" }
    },
    required: ["title", "description", "type", "xpReward"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate a daily quest with a ${mood} vibe.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Failed to generate quest:", error);
    // Fallback quest if API fails
    return {
      title: "Connection Moment",
      description: "Spend 5 minutes holding hands and talking about your favorite memory together.",
      type: "romantic",
      xpReward: 20
    };
  }
};

// --- Date Idea Generation ---

export const generateDateIdeas = async (context: string): Promise<DateIdea[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        estimatedCost: { type: Type.STRING, description: "e.g., Free, $$, $$$" },
        duration: { type: Type.STRING, description: "e.g., 2 hours, All day" }
      },
      required: ["title", "description", "estimatedCost", "duration"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Suggest 3 creative date ideas based on this context: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a creative date planner. Suggest unique, specific, and actionable date ideas."
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Failed to generate date ideas", error);
    return [];
  }
};

// --- Conversation Starters ---

export const generateConversationStarter = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Give us one deep, interesting question to ask each other right now to spark conversation.",
    });
    return response.text || "What is one thing you appreciate most about us?";
  } catch (e) {
    return "What is your favorite memory of us?";
  }
}
