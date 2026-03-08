"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface InsightStats {
    avgMood: number;
    entryCount: number;
    recentMoods: string[];
}

interface InsightData {
    insight_text: string;
    character: string;
    stats: InsightStats;
}

const CHARACTER_EMOJIS: Record<string, string> = {
    "Alice": "👧",
    "White Rabbit": "🐇",
    "Mad Hatter": "🎩",
    "Dormouse": "🐭",
    "Queen of Hearts": "👑",
    "Cheshire Cat": "😸",
    "Tweedledee & Tweedledum": "👯",
    "Caterpillar": "🐛",
};

export function WonderlandInsight() {
    const { user } = useUser();
    const [insight, setInsight] = useState<InsightData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchInsight = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/dashboard?userId=${user.id}`);
                const data = await res.json();

                if (res.ok) {
                    setInsight(data);
                } else {
                    setError(data.error || "Failed to generate insight.");
                }
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsight();
    }, [user?.id]);

    const fontAlice = { fontFamily: "var(--font-alice), serif" } as const;

    if (isLoading && !insight) {
        return (
            <section className="max-w-xl text-center py-12" style={fontAlice}>
                <div className="w-16 h-16 rounded-full border flex items-center justify-center text-xl animate-pulse mx-auto mb-4"
                    style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(240,245,236,0.2)", color: "#f0f5ec" }}>
                    ...
                </div>
                <p className="text-sm" style={{ color: "rgba(240,245,236,0.7)" }}>Peering into the looking glass...</p>
            </section>
        );
    }

    return (
        <section className="max-w-xl" style={fontAlice}>
            <div className="mb-4">
                <h2 className="text-xl font-semibold" style={{ color: "#f0f5ec" }}>Wonderland Insight</h2>
                <p className="text-sm" style={{ color: "rgba(240,245,236,0.65)" }}>
                    Wellness reflection based on your recent journal entries.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(240,245,236,0.15)" }}>
                    <p className="text-sm" style={{ color: "#8b3a5a" }}>{error}</p>
                </div>
            )}

            {insight && (
                <div className="space-y-4">
                    {/* Character card */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(240,245,236,0.15)" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{CHARACTER_EMOJIS[insight.character] || "🃏"}</span>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: "#f0f5ec" }}>You are the {insight.character}</p>
                                <p className="text-xs" style={{ color: "rgba(240,245,236,0.6)" }}>Your Wonderland alter ego</p>
                            </div>
                        </div>
                    </div>

                    {/* Insight text */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(240,245,236,0.15)" }}>
                        <p className="font-medium text-xs uppercase tracking-wide mb-2" style={{ color: "rgba(240,245,236,0.55)" }}>
                            Your Reflection
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#f0f5ec" }}>
                            {insight.insight_text}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(240,245,236,0.15)" }}>
                        <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "rgba(240,245,236,0.55)" }}>Quick Stats</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-xs" style={{ color: "rgba(240,245,236,0.5)" }}>Avg Mood</span>
                                <p className="font-semibold" style={{ color: "#f0f5ec" }}>{insight.stats.avgMood}/10</p>
                            </div>
                            <div>
                                <span className="text-xs" style={{ color: "rgba(240,245,236,0.5)" }}>Entries Analyzed</span>
                                <p className="font-semibold" style={{ color: "#f0f5ec" }}>{insight.stats.entryCount}</p>
                            </div>
                        </div>

                        {insight.stats.recentMoods.length > 0 && (
                            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(240,245,236,0.1)" }}>
                                <span className="text-xs" style={{ color: "rgba(240,245,236,0.5)" }}>Recent Moods</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {insight.stats.recentMoods.map((mood, i) => (
                                        <span key={i} className="text-xs px-2.5 py-1 rounded-full capitalize"
                                            style={{ background: "rgba(240,245,236,0.15)", color: "#f0f5ec" }}>
                                            {mood}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
