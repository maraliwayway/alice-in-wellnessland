"use client";

import { useState } from "react";

interface AnalysisResult {
    mood_score: number | null;
    activities: string[];
    emotions: string[];
    stressors: string[];
    social_interactions: string[];
    health_behaviors: string[];
}

export function JournalAnalyzer() {
    const [entry, setEntry] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!entry.trim() || isAnalyzing) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/analyze-entry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entry }),
            });

            const data = await res.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || "Analysis failed.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderTags = (label: string, items: string[], color: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mt-3">
                <p className="text-stone-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${color}`}>
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-stone-800 mb-1">📝 Analyze a Journal Entry</h2>
            <p className="text-stone-500 text-sm mb-4">
                Write about your day — we&apos;ll extract wellness insights.
            </p>

            <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Today I went for a walk and felt much better after talking to a friend..."
                className="w-full min-h-32 rounded-2xl border border-stone-200 bg-white p-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm leading-relaxed"
            />

            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !entry.trim()}
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    "Analyze Entry ✨"
                )}
            </button>

            {error && <p className="text-rose-500 text-sm mt-3">{error}</p>}

            {result && (
                <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-5">
                    {/* Mood score */}
                    {result.mood_score !== null && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-stone-500 text-sm">Mood Score:</span>
                            <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                                result.mood_score >= 7
                                    ? "bg-emerald-100 text-emerald-700"
                                    : result.mood_score >= 4
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-600"
                            }`}>
                                {result.mood_score}/10
                            </span>
                        </div>
                    )}

                    {renderTags("Emotions", result.emotions, "bg-purple-100 text-purple-700")}
                    {renderTags("Activities", result.activities, "bg-blue-100 text-blue-700")}
                    {renderTags("Stressors", result.stressors, "bg-rose-100 text-rose-600")}
                    {renderTags("Social Interactions", result.social_interactions, "bg-teal-100 text-teal-700")}
                    {renderTags("Health Behaviors", result.health_behaviors, "bg-emerald-100 text-emerald-700")}
                </div>
            )}
        </section>
    );
}
