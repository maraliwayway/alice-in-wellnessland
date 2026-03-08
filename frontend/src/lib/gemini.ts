import { GoogleGenAI } from "@google/genai";

// GoogleGenAI automatically reads GEMINI_API_KEY from process.env.
// No need to pass the key explicitly — just set it in .env.local.
const ai = new GoogleGenAI({});

const MODEL = "gemini-2.0-flash";

/** Single-turn generation */
export async function generateContent(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text ?? "No response.";
}

/** Multi-turn chat generation */
export async function generateChatContent(
  messages: { role: "user" | "model"; text: string }[]
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
  });
  return response.text ?? "No response.";
}