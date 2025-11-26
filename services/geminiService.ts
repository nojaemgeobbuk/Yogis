
import { GoogleGenAI, Type } from "@google/genai";
import type { YogaPose } from '../types';

const schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "The common English name of the yoga pose.",
    },
    sanskritName: {
      type: Type.STRING,
      description: "The traditional Sanskrit name of the yoga pose.",
    },
    description: {
      type: Type.STRING,
      description: "A detailed but encouraging description of the pose, including how to get into it and what to focus on.",
    },
    svgIcon: {
      type: Type.STRING,
      description: "A valid SVG string for a simple, minimalist line-art icon of the pose. The SVG should have a `viewBox='0 0 24 24'`, a black stroke, stroke-width of 1.5, and no fill. It should be a single path if possible.",
    },
    benefits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key benefits of practicing this pose."
    },
    contraindications: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of contraindications or warnings for this pose."
    },
    difficulty: {
        type: Type.STRING,
        description: "The difficulty level of the pose, classified as either 'Beginner', 'Intermediate', or 'Advanced'."
    },
  },
  required: ["name", "sanskritName", "description", "svgIcon", "benefits", "contraindications", "difficulty"],
};


export const fetchPoseInfo = async (poseName: string): Promise<YogaPose | null> => {
  if (!poseName) return null;

  // Create a new GoogleGenAI instance right before the call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const prompt = `Please provide detailed information for the yoga pose: "${poseName}". I need its common English name, Sanskrit name, a detailed description (including how to get into the pose), a list of key benefits, a list of contraindications/cautions, its difficulty level ('Beginner', 'Intermediate', or 'Advanced'), and a simple, minimalist SVG icon.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    // Basic validation
    if (parsed.name && parsed.sanskritName && parsed.description && parsed.svgIcon && Array.isArray(parsed.benefits) && Array.isArray(parsed.contraindications) && parsed.difficulty) {
      return parsed as YogaPose;
    }
    console.error("Parsed JSON does not match YogaPose schema:", parsed);
    return null;

  } catch (error) {
    console.error("Error fetching yoga pose info from Gemini API:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        // This specific error suggests the API key might be invalid or missing permissions.
        // We can use this to re-prompt the user in the UI layer if needed.
        throw new Error("API key not found. Please select a valid API key.");
    }
    return null;
  }
};