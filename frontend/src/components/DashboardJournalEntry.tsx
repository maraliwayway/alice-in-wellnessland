"use client";

import { useState } from "react";
import DashboardMoodRating from "./DashboardMoodRating";
import DashboardVoiceRecorder from "./DashboardVoiceRecorder";

interface JournalEntryResult {
    id: string;
    mood: string;
    moodScore: number;
    validation: string;
    clarity: string;
    affirmation: string;
    createdAt: Date;
}

interface DashboardJournalEntryProps {
    userId: string;
    onEntryCreated?: (entry: JournalEntryResult) => void;
}

export default function DashboardJournalEntry({
    userId,
    onEntryCreated,
}: DashboardJournalEntryProps) {
    const [mode, setMode] = useState<"pick" | "voice" | "write">("pick");
    const [content, setContent] = useState("");
    const [moodRating, setMoodRating] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<JournalEntryResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || content.trim().length < 10) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content, moodRating }),
            });

            const data = (await res.json()) as {
                success: boolean;
                entry: JournalEntryResult;
            };
            if (data.success) {
                setResult(data.entry);
                onEntryCreated?.(data.entry);
            }
        } catch (err) {
            console.error("Failed to submit journal entry:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setContent("");
        setMoodRating(null);
        setResult(null);
        setMode("pick");
    };

    return (
        <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-1">
                🍵 Today&apos;s Entry
            </h2>
            <p className="text-stone-500 text-sm mb-4">
                What&apos;s on your mind today?
            </p>

            {/* ─── Result card (shown after successful submission) ─── */}
            {result ? (
                <>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-4">
                        <p className="text-amber-700 font-medium text-xs uppercase tracking-wide mb-3">
                            The Cheshire Cat hears you 🐱
                        </p>

                        <div>
                            <p className="text-stone-400 text-xs">You&apos;re feeling</p>
                            <p className="text-stone-700 text-sm leading-relaxed mt-0.5">
                                {result.validation}
                            </p>
                        </div>

                        {result.clarity && (
                            <div className="mt-3">
                                <p className="text-stone-400 text-xs">A thought to consider</p>
                                <p className="text-stone-700 text-sm leading-relaxed mt-0.5">
                                    {result.clarity}
                                </p>
                            </div>
                        )}

                        <div className="mt-3">
                            <p className="text-stone-400 text-xs">Remember</p>
                            <p className="italic text-rose-500 text-sm mt-0.5">
                                {result.affirmation}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-stone-400 text-xs mt-4 underline hover:text-stone-600 transition-colors"
                    >
                        Write another entry
                    </button>
                </>
            ) : (
                <>
                    {/* ─── Step 1: Mode picker ─── */}
                    {mode === "pick" && (
                        <div className="grid grid-cols-2 gap-4 my-6">
                            <button
                                onClick={() => setMode("voice")}
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-stone-200 bg-white hover:border-rose-300 hover:shadow-md hover:shadow-rose-100 transition-all duration-300 group"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                    🎙️
                                </span>
                                <span className="font-semibold text-stone-700 text-sm">
                                    Speak your mind
                                </span>
                                <span className="text-stone-400 text-xs text-center leading-relaxed">
                                    Talk freely — we&apos;ll transcribe and reflect it back
                                </span>
                            </button>

                            <button
                                onClick={() => setMode("write")}
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-stone-200 bg-white hover:border-teal-300 hover:shadow-md hover:shadow-teal-100 transition-all duration-300 group"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                    ✏️
                                </span>
                                <span className="font-semibold text-stone-700 text-sm">
                                    Write it out
                                </span>
                                <span className="text-stone-400 text-xs text-center leading-relaxed">
                                    Type at your own pace, no pressure
                                </span>
                            </button>
                        </div>
                    )}

                    {/* ─── Step 2A: Voice guided screen ─── */}
                    {mode === "voice" && (
                        <DashboardVoiceRecorder
                            onTranscript={(text) => {
                                setContent(text);
                                setMode("write");
                            }}
                            onBack={() => setMode("pick")}
                        />
                    )}

                    {/* ─── Step 2B: Write mode ─── */}
                    {mode === "write" && (
                        <form onSubmit={handleSubmit}>
                            {/* Start over */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("pick");
                                    setContent("");
                                    setMoodRating(null);
                                    setResult(null);
                                }}
                                className="text-stone-400 text-xs underline mb-3 hover:text-stone-500 transition-colors"
                            >
                                ← start over
                            </button>

                            {/* Mood rating */}
                            <div className="mb-4">
                                <p className="text-stone-500 text-sm mb-2">
                                    How are you feeling right now?
                                </p>
                                <DashboardMoodRating value={moodRating} onChange={setMoodRating} />
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write freely — this is just for you. What happened today? What are you confused about? What felt hard? There are no wrong answers."
                                className="w-full min-h-40 rounded-2xl border border-stone-200 bg-white p-4 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none text-sm leading-relaxed"
                            />

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting || content.trim().length < 10}
                                className="mt-4 bg-rose-400 hover:bg-rose-500 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Thinking...
                                    </>
                                ) : (
                                    "Share with the Cheshire Cat →"
                                )}
                            </button>
                        </form>
                    )}
                </>
            )}
        </section>
    );
}
