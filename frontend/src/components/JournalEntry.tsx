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
          <div className="rounded-2xl p-5 mt-4 border border-teal-700/35"
            style={{ background: "rgba(6,24,20,0.65)" }}>
            <p className="text-[#7ad8a8] font-medium text-xs uppercase tracking-wide mb-3">
              The Cheshire Cat hears you 🐱
            </p>
            <div>
              <p className="text-[#3a7868] text-xs">You&apos;re feeling</p>
              <p className="text-[#c8ddd5] text-sm leading-relaxed mt-0.5">{result.validation}</p>
            </div>
            {result.clarity && (
              <div className="mt-3">
                <p className="text-[#3a7868] text-xs">A thought to consider</p>
                <p className="text-[#c8ddd5] text-sm leading-relaxed mt-0.5">{result.clarity}</p>
              </div>
            )}
            <div className="mt-3">
              <p className="text-[#3a7868] text-xs">Remember</p>
              <p className="italic text-[#e8a0bf] text-sm mt-0.5">{result.affirmation}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[#3a7868] text-xs mt-4 underline hover:text-[#5a9888] transition-colors"
          >
            Write another entry
          </button>
        </>
      ) : (
        <>
          {/* ─── Mode toggle ─── */}
          {!result && (
            <div className="flex justify-center gap-1 my-5">
              <button
                onClick={() => setMode("voice")}
                title="Speak your mind"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                  mode === "voice"
                    ? "border-teal-500/60 text-[#a8dcc8] bg-teal-900/40"
                    : "border-teal-900/40 text-[#3a7868] hover:text-[#6aaa90] hover:border-teal-700/50"
                }`}
              >
                <span>🎙️</span> Voice
              </button>
              <button
                onClick={() => setMode("write")}
                title="Write it out"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                  mode === "write"
                    ? "border-teal-500/60 text-[#a8dcc8] bg-teal-900/40"
                    : "border-teal-900/40 text-[#3a7868] hover:text-[#6aaa90] hover:border-teal-700/50"
                }`}
              >
                <span>✏️</span> Write
              </button>
            </div>
          )}

          {/* ─── Voice ─── */}
          {mode === "voice" && (
            <VoiceRecorder
              onTranscript={(text) => { setContent(text); setMode("write"); }}
              onBack={() => setMode("write")}
            />
          )}

          {/* ─── Write ─── */}
          {(mode === "write" || mode === "pick") && (
            <form onSubmit={handleSubmit}>

              <div className="mb-4">
                <p className="text-[#5a9888] text-sm mb-2">How are you feeling right now?</p>
                <MoodRating value={moodRating} onChange={setMoodRating} />
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely — this is just for you. What happened today? What are you confused about? What felt hard? There are no wrong answers."
                className="w-full min-h-40 rounded-2xl border p-4 resize-none text-sm leading-relaxed focus:outline-none focus:ring-2 transition-colors"
                style={{
                  background: "rgba(6,18,28,0.6)",
                  borderColor: "rgba(74,152,128,0.3)",
                  color: "#dde8e0",
                  caretColor: "#7ad8a8",
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting || content.trim().length < 10}
                className="mt-4 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 border"
                style={{
                  background: "rgba(58,130,100,0.55)",
                  borderColor: "rgba(80,160,120,0.4)",
                  color: "#c8ece0",
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
