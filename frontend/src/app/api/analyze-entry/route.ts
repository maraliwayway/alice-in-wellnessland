import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

interface JournalEntry {
    entry_text: string;
    mood_score: number | null;
    activities: string[];
    emotions: string[];
    stressors: string[];
    social_interactions: string[];
    health_behaviors: string[];
    created_at: Date;
}

const journalEntries: JournalEntry[] = [];

export function getJournalEntries() {
    return journalEntries;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { entry } = body;

        if (!entry || typeof entry !== 'string') {
            return NextResponse.json({ error: 'Valid entry string is required' }, { status: 400 });
        }

        const prompt = `You are a wellness journal analysis system.

Extract structured wellness information from the journal entry.

Return ONLY raw JSON. Do not include markdown formatting, backticks, or any other text.
Return ONLY valid JSON with this schema:

{
  "mood_score": number (1-10 or null),
  "activities": string[],
  "emotions": string[],
  "stressors": string[],
  "social_interactions": string[],
  "health_behaviors": string[]
}

Journal entry:
${entry}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let result;
        try {
            let text = response.text || '';
            // Safely extract JSON in case Gemini returns markdown tags
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                text = jsonMatch[1];
            } else {
                text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            }
            result = text ? JSON.parse(text) : null;
        } catch (parseError) {
            console.error('Error parsing Gemini JSON response:', parseError);
            return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 });
        }

        const structuredData = {
            entry_text: entry,
            mood_score: result?.mood_score ?? null,
            activities: result?.activities ?? [],
            emotions: result?.emotions ?? [],
            stressors: result?.stressors ?? [],
            social_interactions: result?.social_interactions ?? [],
            health_behaviors: result?.health_behaviors ?? [],
            created_at: new Date()
        };

        journalEntries.push(structuredData);

        return NextResponse.json({
            success: true,
            data: {
                mood_score: result?.mood_score ?? null,
                activities: result?.activities ?? [],
                emotions: result?.emotions ?? [],
                stressors: result?.stressors ?? [],
                social_interactions: result?.social_interactions ?? [],
                health_behaviors: result?.health_behaviors ?? []
            }
        });
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze entry.' },
            { status: 500 }
        );
    }
}
