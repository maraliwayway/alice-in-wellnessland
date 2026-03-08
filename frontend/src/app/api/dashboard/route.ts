import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Fetch the 5 most recent journal entries from MongoDB
        const recentEntries = await db
            .collection("journals")
            .find({ userId }, { projection: { embedding: 0 } })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        if (recentEntries.length === 0) {
            return NextResponse.json({ error: 'No journal entries found to analyze.' }, { status: 404 });
        }

        let validMoodCount = 0;
        let totalMood = 0;
        let stressCount = 0;
        const emotionList: string[] = [];

        recentEntries.forEach(entry => {
            if (entry.moodScore != null) {
                totalMood += entry.moodScore;
                validMoodCount++;
            }
            // Use mood field as an emotion signal
            if (entry.mood) {
                emotionList.push(entry.mood.toLowerCase());
            }
        });

        const avgMood = validMoodCount > 0 ? (totalMood / validMoodCount) : 5;

        // Determine character based on emotional patterns
        let character = "Alice";

        const hasEmotion = (keywords: string[]) =>
            emotionList.some(emotion => keywords.some(keyword => emotion.includes(keyword)));

        if (avgMood <= 3) {
            character = "White Rabbit";
        } else if (hasEmotion(["overwhelmed", "chaotic", "scattered", "stressed"])) {
            character = "Mad Hatter";
        } else if (hasEmotion(["tired", "exhausted", "sleepy"])) {
            character = "Dormouse";
        } else if (hasEmotion(["angry", "frustrated"])) {
            character = "Queen of Hearts";
        } else if (avgMood >= 7) {
            character = "Cheshire Cat";
        } else if (hasEmotion(["reflective", "curious", "thoughtful"])) {
            character = "Caterpillar";
        }

        const stats = {
            avgMood: Number(avgMood.toFixed(1)),
            entryCount: recentEntries.length,
            recentMoods: emotionList,
        };

        const summary = {
            ...stats,
            character,
            recentEntries: recentEntries.map(e => ({
                content: e.content?.slice(0, 200),
                mood: e.mood,
                moodScore: e.moodScore,
                affirmation: e.affirmation,
            })),
        };

        const prompt = `You are generating a supportive wellness reflection for a journaling app themed around Alice in Wonderland.

Write 2–3 sentences describing the user's recent emotional patterns based on the journaling data below.

Suggest a small actionable thing that might support their wellbeing, stated naturally as a warm observation (e.g., "I notice your mood tends to lift when you..."). Do not use clinical or robotic words like "data" or "correlation".

Finally, include a Wonderland character reflection with a one-sentence description of why the user resembles their assigned character (${character}).

Data:
${JSON.stringify(summary, null, 2)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const insight_text = response.text || '';

        return NextResponse.json({
            insight_text,
            character,
            stats
        });

    } catch (error) {
        console.error('Insight Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate insight.' }, { status: 500 });
    }
}
