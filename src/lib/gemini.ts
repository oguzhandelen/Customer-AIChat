import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",  // Özel model yerine standart modeli kullanalım
});

const generationConfig = {
  temperature: 0.7,     // Daha tutarlı yanıtlar için düşürüldü
  topP: 0.8,           // Daha tutarlı yanıtlar için düşürüldü
  topK: 40,            // Daha tutarlı yanıtlar için düşürüldü
  maxOutputTokens: 2048, // Makul bir değere düşürüldü
};

export const startNewChat = () => {
  try {
    return model.startChat({
      generationConfig,
      history: [],
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });
  } catch (error) {
    console.error('Chat başlatılırken hata:', error);
    throw new Error('Sohbet başlatılamadı. Lütfen daha sonra tekrar deneyin.');
  }
};

export type ChatSession = Awaited<ReturnType<typeof startNewChat>>;

export class GeminiError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

export const isGeminiError = (error: unknown): error is GeminiError => {
  return error instanceof GeminiError;
};