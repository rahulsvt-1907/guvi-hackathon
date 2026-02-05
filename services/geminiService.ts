
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResponse, Language, Classification } from "../types";
import { usageTracker } from "./usageService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a world-class audio forensic expert specializing in detecting synthetic vs. human voices.
You will be provided with an MP3 audio file.
Your task is to analyze the spectral patterns, rhythmic consistency, emotional depth, and linguistic nuances to determine if the voice is AI-generated or Human.

Key Indicators of AI Voice:
- Unnatural pitch consistency or perfect monotonic delivery.
- Robotic artifacts or phased frequencies.
- Lack of natural breathing or mouth clicks.
- Repetitive spectral patterns.

Key Indicators of Human Voice:
- Natural variability in pitch, volume, and pace.
- Micro-interruptions or natural speech artifacts.
- Emotional resonance that aligns with context.

Strictly adhere to the provided schema for your response.
`;

export async function detectVoiceAuthenticity(
  base64Audio: string,
  language: Language
): Promise<DetectionResponse> {
  if (!usageTracker.canMakeRequest()) {
    return {
      status: "error",
      language: language,
      classification: Classification.HUMAN,
      confidenceScore: 0,
      explanation: "API Quota Exhausted. Request blocked to prevent billing.",
      message: "QUOTA_EXHAUSTED"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "audio/mpeg",
                data: base64Audio,
              },
            },
            {
              text: `Analyze this audio in ${language}. Is this voice AI-generated or Human? Return the result in JSON format.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["success", "error"] },
            language: { type: Type.STRING },
            classification: { type: Type.STRING, enum: ["AI_GENERATED", "HUMAN"] },
            confidenceScore: { type: Type.NUMBER, description: "A score between 0 and 1" },
            explanation: { type: Type.STRING, description: "Detailed reason for the classification" },
          },
          required: ["status", "language", "classification", "confidenceScore", "explanation"],
        },
        maxOutputTokens: 400,
        thinkingConfig: { thinkingBudget: 200 },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    // Record usage on success
    usageTracker.recordRequest();

    const data = JSON.parse(resultText) as DetectionResponse;
    return data;
  } catch (error: any) {
    console.error("Gemini Detection Error:", error);
    
    // Catch specific billing/quota errors
    const errorMsg = error?.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("402") || errorMsg.includes("billing")) {
      usageTracker.forceStop();
      return {
        status: "error",
        language: language,
        classification: Classification.HUMAN,
        confidenceScore: 0,
        explanation: "Critical: API Quota or Billing limit reached. Service suspended.",
        message: "QUOTA_EXHAUSTED"
      };
    }

    return {
      status: "error",
      language: language,
      classification: Classification.HUMAN,
      confidenceScore: 0,
      explanation: "Analysis failed due to a processing error.",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
