
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, CaseStudy } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeAsset = async (file: File, mimeType: string, useThinking: boolean = false): Promise<Partial<Asset>> => {
  const reader = new FileReader();
  const base64Data = await new Promise<string>((resolve) => {
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: `Analyze this file and extract its properties for a professional naming convention: [topic]-[type]-[context]-[variant]-[version]. 
                 Return standard text strings for each field. DO NOT use artificial spacing between characters.
                 Return as JSON with keys: topic, type, context, variant, version.` }
      ]
    },
    config: {
      ...(useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {}),
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          type: { type: Type.STRING },
          context: { type: Type.STRING },
          variant: { type: Type.STRING },
          version: { type: Type.STRING },
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
};

export const generateCaseStudy = async (assets: Asset[], contextPrompt: string, useThinking: boolean = true): Promise<Partial<CaseStudy>> => {
  const assetInfo = assets.map(a => `- ${a.aiName} (${a.topic}, ${a.context})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on these design artifacts:
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
    
    Return as a structured JSON object.`,
    config: {
      ...(useThinking ? { thinkingConfig: { thinkingBudget: 32768 } } : {}),
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
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
