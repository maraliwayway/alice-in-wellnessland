import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

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
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${systemPrompt}\n\n${transcribedText}`,
        });

        const responseText = (response.text ?? "").trim();

        // Strip markdown code fences if present
        const cleaned = responseText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        const parsed = JSON.parse(cleaned) as JournalAnalysis;
        return parsed;
    } catch {
        return FALLBACK_ANALYSIS;
    }
}

export async function getEmbedding(text: string): Promise<number[]> {
    const result = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: text,
    });
    return result.embeddings?.[0]?.values ?? [];
}
