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
        const uniqueHabits = new Set<string>();

        const normalizeHabit = (habit: string) => {
            const lowerHabit = habit.toLowerCase();
            const exerciseKeywords = ["run", "running", "jog", "gym", "workout", "exercise", "walk", "bike", "ride", "cycle"];
            const socialKeywords = ["friend", "talk", "coffee", "dinner", "hang", "meet"];

            if (exerciseKeywords.some(keyword => lowerHabit.includes(keyword))) {
                return "exercise";
            }
            if (socialKeywords.some(keyword => lowerHabit.includes(keyword))) {
                return "socializing";
            }
            return lowerHabit;
        };

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

            const habitEvents = [
                ...(entry.activities || []),
                ...(entry.health_behaviors || []),
                ...(entry.social_interactions || [])
            ];
            habitEvents.forEach(h => {
                const normalized = normalizeHabit(h);
                uniqueHabits.add(normalized);
            });
        });

        const avgMood = validMoodCount > 0 ? (totalMood / validMoodCount) : 5; // Default middle

        const habitBoosts: { habit: string; boost: number }[] = [];

        uniqueHabits.forEach(habit => {
            let moodWith = 0;
            let countWith = 0;

            recentEntries.forEach(entry => {
                if (entry.mood_score !== null) {
                    const habitEvents = [
                        ...(entry.activities || []),
                        ...(entry.health_behaviors || []),
                        ...(entry.social_interactions || [])
                    ].map(h => normalizeHabit(h));

                    if (habitEvents.includes(habit)) {
                        moodWith += entry.mood_score;
                        countWith++;
                    }
                }
            });

            if (countWith > 0) {
                const averageMoodWithHabit = moodWith / countWith;

                let score = 0;
                if (validMoodCount < 6) {
                    // With fewer than 6 entries, use raw average so we don't zero out habits that always occur
                    score = averageMoodWithHabit;
                } else {
                    // With 6+ entries, compare against overall baseline
                    score = averageMoodWithHabit - avgMood;
                }

                if (score > 0) {
                    habitBoosts.push({ habit, boost: score });
                }
            }
        });

        habitBoosts.sort((a, b) => b.boost - a.boost);

        let topHabit: string | null = null;
        let topHabitBoost: number | null = null;
        let secondHabit: string | null = null;
        let secondHabitBoost: number | null = null;

        if (habitBoosts.length > 0) {
            topHabit = habitBoosts[0].habit;
            topHabitBoost = Number(habitBoosts[0].boost.toFixed(1));
        }
        if (habitBoosts.length > 1) {
            secondHabit = habitBoosts[1].habit;
            secondHabitBoost = Number(habitBoosts[1].boost.toFixed(1));
        }

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
            socialCount,
            topHabit,
            topHabitBoost,
            secondHabit,
            secondHabitBoost
        };

        const summary = {
            ...stats,
            character
        };

        const prompt = `You are generating a supportive wellness reflection for a journaling app themed around Alice in Wonderland. 

Write 2–3 sentences describing the user's recent emotional patterns based on the journaling data below. 

If a positive habit correlation exists (like topHabit), suggest that specific activity as a small thing that might support their wellbeing. State this correlation naturally, as a warm observation backed by their journal entries (e.g., "I notice your mood tends to lift when you..."). Do not use clinical or robotic words like "data" or "correlation". If no habit is found, suggest a general small activity.

Finally, include a Wonderland character reflection with a one-sentence description of why the user resembles their assigned character.

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
// export async function GET() {
//   return Response.json({
//     insight_text:
//       "Recently your journal suggests you've been feeling a bit overwhelmed and uncertain, especially around work. Starting something new often comes with a steep learning curve, and it's normal to feel this way early on. Taking a short walk or stepping away briefly might help reset your mental energy.",
//     character: "White Rabbit",
//     stats: {
//       avgMood: 3.4,
//       stressCount: 6,
//       healthCount: 1,
//       socialCount: 2
//     }
//   })
// }