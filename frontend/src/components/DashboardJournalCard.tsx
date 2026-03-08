"use client";

import React from "react";

interface JournalEntry {
    _id: string;
    content: string;
    mood: string;
    moodScore: number;
    validation: string;
    affirmation: string;
    moodRating: number | null;
    createdAt: string | Date;
}

const MOOD_EMOJIS_MAP: Record<number, string> = {
    1: "😔",
    2: "😟",
    3: "😐",
    4: "🙂",
    5: "😊",
};

function getMoodEmoji(mood: string): string {
    const lower = mood.toLowerCase();
    if (["overwhelmed", "stressed", "anxious"].includes(lower)) return "🌀";
    if (["sad", "down", "depressed"].includes(lower)) return "🌧️";
    if (["happy", "excited", "great"].includes(lower)) return "✨";
    if (["confused", "lost", "unclear"].includes(lower)) return "🤔";
    if (["tired", "exhausted"].includes(lower)) return "💤";
    if (["grateful", "good", "okay"].includes(lower)) return "🌸";
    return "🫖";
}

function getMoodScoreStyle(score: number): string {
    if (score >= 7) return "bg-emerald-100 text-emerald-700";
    if (score >= 4) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-600";
}

function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

interface DashboardJournalCardProps {
    entry: JournalEntry;
}

export default function DashboardJournalCard({ entry }: DashboardJournalCardProps) {
    const emoji = getMoodEmoji(entry.mood);
    const moodLabel =
        entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);
    const scoreStyle = getMoodScoreStyle(entry.moodScore);
    const preview =
        entry.content.length > 150
            ? entry.content.slice(0, 150) + "..."
            : entry.content;

    return (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md hover:border-stone-300 transition-all duration-300">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-stone-700 text-sm font-medium">{moodLabel}</span>
                    {entry.moodRating !== null && entry.moodRating !== undefined && (
                        <span className="text-lg ml-1">
                            {MOOD_EMOJIS_MAP[entry.moodRating]}
                        </span>
                    )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreStyle}`}>
                    {entry.moodScore}/10
                </span>
            </div>

            {/* Date */}
            <p className="text-stone-400 text-xs mt-1">{formatDate(entry.createdAt)}</p>

            {/* Content preview */}
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">{preview}</p>

            {/* Affirmation */}
            {entry.affirmation && (
                <p className="italic text-stone-400 text-xs mt-2">
                    🐱 {entry.affirmation}
                </p>
            )}
        </div>
    );
}
