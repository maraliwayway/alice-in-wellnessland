import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// The SDK automatically picks up the GEMINI_API_KEY environment variable.
export const ai = new GoogleGenAI({});
