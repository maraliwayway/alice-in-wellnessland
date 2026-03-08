import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type, Schema } from '@google/genai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { entry } = body;

        if (!entry || typeof entry !== 'string') {
            return NextResponse.json({ error: 'Valid entry string is required' }, { status: 400 });
        }

        const prompt = `You are a wellness journal analysis system.

Extract structured wellness information from the journal entry.

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
            const text = response.text;
            result = text ? JSON.parse(text) : null;
        } catch (parseError) {
            console.error('Error parsing Gemini JSON response:', parseError);
            return NextResponse.json({ error: 'Failed to parsing structured data' }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze entry.' },
            { status: 500 }
        );
    }
}
