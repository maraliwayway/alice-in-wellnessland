import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { getJournalEntries } from '../analyze-entry/route';

export async function GET() {
    try {
        const allEntries = getJournalEntries();
        // Use the 5 most recent entries
        const recentEntries = allEntries.slice(-5);

        if (recentEntries.length === 0) {
            return NextResponse.json({ error: 'No journal entries found to analyze.' }, { status: 404 });
        }

        let validMoodCount = 0;
        let totalMood = 0;
        let stressCount = 0;
        let healthCount = 0;
        let socialCount = 0;
        const emotionList: string[] = [];

        recentEntries.forEach(entry => {
            if (entry.mood_score !== null) {
                totalMood += entry.mood_score;
                validMoodCount++;
            }
            stressCount += entry.stressors.length;
            healthCount += entry.health_behaviors.length;
            socialCount += entry.social_interactions.length;

            // Collect and flatten all emotions, converting to lower case for easy matching
            if (entry.emotions) {
                entry.emotions.forEach(e => emotionList.push(e.toLowerCase()));
            }
        });

        const avgMood = validMoodCount > 0 ? (totalMood / validMoodCount) : 5; // Default middle

        let character = "Alice";

        const isHighStress = stressCount >= 3;
        const isHighSocial = socialCount >= 3;

        const hasEmotion = (keywords: string[]) =>
            emotionList.some(emotion => keywords.some(keyword => emotion.includes(keyword)));

        if (avgMood <= 3 && isHighStress) {
            character = "White Rabbit";
        } else if (hasEmotion(["overwhelmed", "chaotic", "scattered"])) {
            character = "Mad Hatter";
        } else if (hasEmotion(["tired", "exhausted", "sleepy"])) {
            character = "Dormouse";
        } else if (hasEmotion(["angry", "frustrated"])) {
            character = "Queen of Hearts";
        } else if (healthCount > stressCount && avgMood >= 7) {
            character = "Cheshire Cat";
        } else if (isHighSocial) {
            character = "Tweedledee & Tweedledum";
        } else if (hasEmotion(["reflective", "curious", "thoughtful"])) {
            character = "Caterpillar";
        }

        const stats = {
            avgMood: Number(avgMood.toFixed(1)),
            stressCount,
            healthCount,
            socialCount
        };

        const summary = {
            ...stats,
            character
        };

        const prompt = `You are generating a supportive wellness reflection for a journaling app themed around Alice in Wonderland.

Write 2–3 sentences describing the user's recent emotional patterns based on the data below.

Then suggest one small activity that might support their wellbeing.

Finally include a Wonderland character reflection with a one-sentence description of why the user resembles that character.

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
