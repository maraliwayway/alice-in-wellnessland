'use client';

import React, { useState, useEffect } from 'react';

interface InsightResponse {
    insight_text: string;
    character: string;
    stats?: {
        avgMood: number;
        stressCount: number;
        healthCount: number;
        socialCount: number;
    };
    error?: string;
}

export function WonderlandInsight() {
    const [loading, setLoading] = useState(true);
    const [insightData, setInsightData] = useState<InsightResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchInsight = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/generate-insight');
            const data: InsightResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch insight');
            }

            setInsightData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-pink-50/50 rounded-3xl shadow-sm border border-pink-100 flex justify-center items-center min-h-[250px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                    <p className="text-purple-600 font-medium font-serif italic text-lg opacity-80 animate-pulse">Consulting the caterpillar...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 bg-red-50/50 rounded-3xl shadow-sm border border-red-100 flex flex-col items-center">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                {error === 'No journal entries found to analyze.' && (
                    <p className="text-gray-500 text-sm italic">
                        Try adding a new entry above first!
                    </p>
                )}
                <button
                    onClick={fetchInsight}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!insightData) return null;

    return (
        <div className="w-full max-w-2xl mx-auto p-8 sm:p-10 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-sm border border-purple-100/60 relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10 text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-purple-900 inline-flex items-center gap-2">
                    <span className="text-2xl">✨</span> Your Wonderland Reflection <span className="text-2xl">✨</span>
                </h2>
            </div>

            <div className="relative z-10 bg-white/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] text-left">
                <p className="text-purple-950/80 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                    {insightData.insight_text}
                </p>
            </div>

            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm flex flex-col items-center text-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-4 block">
                    Your Wonderland Mirror
                </h3>

                <div className="inline-block bg-gradient-to-r from-purple-200 to-pink-200 shadow-md border border-white/50 px-8 py-3 rounded-full mb-2">
                    <span className="text-purple-900 text-2xl font-serif font-bold tracking-wide">
                        {insightData.character}
                    </span>
                </div>
            </div>

            {insightData.stats && (
                <div className="relative z-10 mt-6 flex justify-center flex-wrap gap-x-6 gap-y-2 text-xs text-purple-600/60 font-medium uppercase tracking-wider">
                    <span title="Average Mood">Mood: {insightData.stats.avgMood}</span>
                    <span title="Stressors Detected">Stress: {insightData.stats.stressCount}</span>
                    <span title="Healthy Behaviors">Health: {insightData.stats.healthCount}</span>
                </div>
            )}

            {/* Refresh button */}
            <div className="relative z-10 mt-6 flex justify-center">
                <button
                    onClick={fetchInsight}
                    className="text-xs text-purple-400 hover:text-purple-600 underline underline-offset-4 decoration-purple-300 transition-colors"
                >
                    Refresh Insight
                </button>
            </div>
        </div>
    );
}
