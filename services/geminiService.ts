
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, CaseStudy } from "../types";

// Note: GoogleGenAI client is initialized inside each function call 
// to ensure the latest API key is always used from process.env.API_KEY.

export const analyzeAsset = async (file: File, mimeType: string, useThinking: boolean = false): Promise<Partial<Asset>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error("Failed to read file for analysis"));
      reader.readAsDataURL(file);
    });

    const modelName = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    // Guidelines: Flash thinking budget max is 24576, Pro is 32768.
    // Guidelines: MUST set maxOutputTokens when setting thinkingBudget.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Analyze this file and extract its properties for a professional naming convention: [topic]-[type]-[context]-[variant]-[version]. 
                   Return standard text strings for each field. DO NOT use artificial spacing between characters.
                   Return as JSON with keys: topic, type, context, variant, version.` }
        ]
      },
      config: {
        ...(useThinking 
          ? { 
              thinkingConfig: { thinkingBudget: 16384 },
              maxOutputTokens: 20480 // budget + overhead for response
            } 
          : {}),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            type: { type: Type.STRING },
            context: { type: Type.STRING },
            variant: { type: Type.STRING },
            version: { type: Type.STRING },
          },
          required: ["topic", "type", "context", "variant", "version"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No analysis data returned from model");
    }

    return JSON.parse(response.text);
  } catch (e: any) {
    console.error("Failed to analyze asset", e);
    // If it was a thinking error, retry without thinking as a fallback
    if (useThinking) {
      console.warn("Retrying analysis without thinking mode...");
      return analyzeAsset(file, mimeType, false);
    }
    throw new Error(e.message || "Failed to analyze file metadata");
  }
};

export const generateCaseStudy = async (assets: Asset[], contextPrompt: string, useThinking: boolean = true): Promise<Partial<CaseStudy>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const assetInfo = assets.map(a => `- ${a.aiName} (${a.topic}, ${a.context})`).join('\n');
    
    // Using gemini-3-pro-preview for complex synthesis tasks.
    // Pairing thinkingBudget with maxOutputTokens to prevent 500 Internal Errors.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `Based on these design artifacts:
      ${assetInfo}
      
      And this user context: "${contextPrompt}"
      
      Create a professional UX/FE mini-case study. 
      IMPORTANT: Return standard, human-readable text. DO NOT add spaces between every letter (e.g., return "User Account" not "U S E R  A C C O U N T").
      
      Format:
      - title: Clear, descriptive title.
      - problem: Concise challenge statement.
      - approach: Technical methodology.
      - outcome: Results achieved.
      - nextSteps: Future roadmap.
      - seoMetadata: { title, description, keywords[] }
      - tags: 3 string tags.
      
      Return as a structured JSON object.`
          }
        ]
      },
      config: {
        ...(useThinking 
          ? { 
              thinkingConfig: { thinkingBudget: 24576 },
              maxOutputTokens: 32768 
            } 
          : {}),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            problem: { type: Type.STRING },
            approach: { type: Type.STRING },
            outcome: { type: Type.STRING },
            nextSteps: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            seoMetadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["title", "problem", "approach", "outcome", "nextSteps", "tags", "seoMetadata"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No case study content generated");
    }

    return JSON.parse(response.text);
  } catch (e: any) {
    console.error("Failed to generate case study", e);
    // Fallback: If Pro/Thinking fails with 500, try Flash without thinking for robustness
    if (useThinking) {
      console.warn("Retrying synthesis with Flash fallback...");
      const aiFallback = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fallbackResponse = await aiFallback.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on these design artifacts:\n${assets.map(a => a.aiName).join(', ')}\n\nCreate a case study JSON with title, problem, approach, outcome, nextSteps, tags, and seoMetadata (title, description, keywords).`,
        config: { responseMimeType: 'application/json' }
      });
      if (fallbackResponse.text) return JSON.parse(fallbackResponse.text);
    }
    throw new Error(e.message || "Failed to synthesize case study content");
  }
};
