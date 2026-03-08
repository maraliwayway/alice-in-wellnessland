import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiApiKey } from "@/lib/secrets";

// Lazy singleton — initialized on first call, reused after
let _genAI: GoogleGenerativeAI | null = null;

async function getGenAI(): Promise<GoogleGenerativeAI> {
  if (!_genAI) {
    const apiKey = await getGeminiApiKey();
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

export async function getGeminiFlash() {
  const genAI = await getGenAI();
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export async function getGeminiEmbedding() {
  const genAI = await getGenAI();
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

export interface JournalAnalysis {
  mood: string;
  moodScore: number;
  validation: string;
  clarity: string;
  affirmation: string;
}

const FALLBACK_ANALYSIS: JournalAnalysis = {
  mood: "reflective",
  moodScore: 5,
  validation: "It takes courage to sit with these feelings.",
  clarity:
    "Try writing down exactly what's unclear and sharing it with your mentor.",
  affirmation: "Even Alice had to start somewhere in Wonderland.",
};

export async function analyzeJournalEntry(
  transcribedText: string
): Promise<JournalAnalysis> {
  const systemPrompt = `You are a warm, wise AI companion for a co-op intern navigating their first tech job. You speak like a caring mentor — never clinical, never dismissive. Analyze this journal entry and return ONLY valid JSON with: mood (one word emotion), moodScore (1-10, 10=happiest), validation (1 sentence acknowledging their feelings without toxic positivity), clarity (1-2 sentence practical suggestion — e.g. how to communicate with their tech lead, how to frame a question, how to approach an unclear ticket), affirmation (1 warm encouraging sentence, can reference Alice in Wonderland characters subtly — Cheshire Cat, Caterpillar's 'Who are you?', etc.). Only return valid JSON, nothing else.`;

  try {
    const model = await getGeminiFlash();
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: transcribedText },
    ]);

    const responseText = result.response.text().trim();
    const cleaned = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned) as JournalAnalysis;
  } catch {
    return FALLBACK_ANALYSIS;
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getGeminiEmbedding();
  const result = await model.embedContent(text);
  return result.embedding.values;
}
