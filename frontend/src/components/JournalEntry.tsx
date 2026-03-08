"use client";

import { useState } from "react";
import MoodRating from "./MoodRating";
import VoiceRecorder from "./VoiceRecorder";

interface JournalEntryResult {
  id: string;
  mood: string;
  moodScore: number;
  validation: string;
  clarity: string;
  affirmation: string;
  createdAt: Date;
}

interface JournalEntryProps {
  userId: string;
  onEntryCreated?: (entry: JournalEntryResult) => void;
}

export default function JournalEntry({ userId, onEntryCreated }: JournalEntryProps) {
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
      const data = (await res.json()) as { success: boolean; entry: JournalEntryResult };
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
      <h2 className="text-2xl font-semibold text-[#dde8e0] mb-1 text-center">
        🍵 Today&apos;s Entry
      </h2>
      <p className="text-[#5a9888] text-sm mb-5 text-center">
        What&apos;s on your mind today?
      </p>

      {/* ─── Result card ─── */}
      {result ? (
        <>
          <div className="rounded-2xl p-5 mt-4 border border-green-500/25"
            style={{ background: "rgba(6,28,12,0.62)" }}>
            <p className="text-[#7acc70] font-medium text-xs uppercase tracking-wide mb-3">
              The Cheshire Cat hears you 🐱
            </p>
            <div>
              <p className="text-[#4a9858] text-xs">You&apos;re feeling</p>
              <p className="text-[#c8ddd5] text-sm leading-relaxed mt-0.5">{result.validation}</p>
            </div>
            {result.clarity && (
              <div className="mt-3">
                <p className="text-[#4a9858] text-xs">A thought to consider</p>
                <p className="text-[#c8ddd5] text-sm leading-relaxed mt-0.5">{result.clarity}</p>
              </div>
            )}
            <div className="mt-3">
              <p className="text-[#4a9858] text-xs">Remember</p>
              <p className="italic text-[#e8a0bf] text-sm mt-0.5">{result.affirmation}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[#4a9858] text-xs mt-4 underline hover:text-[#6ab870] transition-colors"
          >
            Write another entry
          </button>
        </>
      ) : (
        <>
          {/* ─── Pick mode: two big buttons ─── */}
          {mode === "pick" && (
            <div className="flex justify-center gap-6 my-8">
              <button
                onClick={() => setMode("voice")}
                className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(6,28,12,0.55)",
                  borderColor: "rgba(80,180,80,0.30)",
                }}
              >
                <span className="text-4xl">🎙️</span>
                <span className="text-[#c8ecc0] text-sm font-medium tracking-wide">Voice</span>
                <span className="text-[#5a9868] text-xs">Speak your mind</span>
              </button>
              <button
                onClick={() => setMode("write")}
                className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(6,28,12,0.55)",
                  borderColor: "rgba(80,180,80,0.30)",
                }}
              >
                <span className="text-4xl">✏️</span>
                <span className="text-[#c8ecc0] text-sm font-medium tracking-wide">Write</span>
                <span className="text-[#5a9868] text-xs">Write it out</span>
              </button>
            </div>
          )}

          {/* ─── Voice ─── */}
          {mode === "voice" && (
            <VoiceRecorder
              onTranscript={(text) => { setContent(text); setMode("write"); }}
              onBack={() => setMode("pick")}
            />
          )}

          {/* ─── Write ─── */}
          {mode === "write" && (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
              {/* Back button — left-aligned full width */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setMode("pick")}
                  className="text-[#5a9868] text-xs underline hover:text-[#7acc88] transition-colors"
                >
                  ← back
                </button>
              </div>

              {/* Mood rating — centered */}
              <div className="w-full text-center">
                <p className="text-[#6ab870] text-sm mb-3">How are you feeling right now?</p>
                <div className="flex justify-center">
                  <MoodRating value={moodRating} onChange={setMoodRating} />
                </div>
              </div>

              {/* Textarea — full width */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely — this is just for you. What happened today? What are you confused about? What felt hard? There are no wrong answers."
                className="w-full min-h-32 rounded-xl border p-4 resize-none text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-colors"
                style={{
                  background: "rgba(4,20,8,0.55)",
                  borderColor: "rgba(80,180,80,0.28)",
                  color: "#dde8d8",
                  caretColor: "#7acc70",
                }}
              />

              {/* Submit button — centered */}
              <button
                type="submit"
                disabled={isSubmitting || content.trim().length < 10}
                className="rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border"
                style={{
                  background: "rgba(18,80,25,0.60)",
                  borderColor: "rgba(80,200,80,0.40)",
                  color: "#c8ecc0",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
