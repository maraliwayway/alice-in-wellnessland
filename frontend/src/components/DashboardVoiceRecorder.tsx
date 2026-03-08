"use client";

import { useMemo, useRef, useState } from "react";

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    onBack: () => void;
}

const PROMPTS = [
    "What happened at work today?",
    "What's something that felt unclear or confusing?",
    "How did your team interactions feel today?",
    "What's been weighing on you lately?",
    "Is there something you wish you could say but haven't?",
    "What would make tomorrow feel better than today?",
];

export default function DashboardVoiceRecorder({ onTranscript, onBack }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const prompt = useMemo(
        () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
        []
    );

    const handleStop = async () => {
        setIsTranscribing(true);
        setError(null);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
            const res = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });
            const data = (await res.json()) as { transcript?: string; error?: string };

            if (data.transcript) {
                onTranscript(data.transcript);
            } else {
                setError("Couldn't catch that — try again?");
            }
        } catch {
            setError("Couldn't catch that — try again?");
        } finally {
            setIsTranscribing(false);
        }
    };

    const startRecording = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                void handleStop();
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
        } catch {
            setError("Mic access denied — please allow microphone permissions.");
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== "inactive") {
            recorder.stop();
            recorder.stream.getTracks().forEach((t) => t.stop());
        }
        setIsRecording(false);
    };

    return (
        <div className="flex flex-col items-center text-center py-8 gap-6">
            {/* Back link */}
            <button
                onClick={onBack}
                className="self-start text-stone-400 text-xs underline hover:text-stone-500 transition-colors"
            >
                ← back
            </button>

            {/* Prompt card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 max-w-sm">
                <p className="text-amber-700 text-xs font-medium uppercase tracking-wide mb-2">
                    Start with this...
                </p>
                <p className="text-stone-700 text-base leading-relaxed font-medium">
                    &ldquo;{prompt}&rdquo;
                </p>
                <p className="text-stone-400 text-xs mt-2">
                    Or just talk freely — whatever comes to mind.
                </p>
            </div>

            {/* Big mic button — idle */}
            {!isRecording && !isTranscribing && (
                <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-3xl shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:scale-105 transition-all duration-300 flex items-center justify-center"
                    aria-label="Start recording"
                >
                    🎙️
                </button>
            )}

            {/* Recording active */}
            {isRecording && (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-rose-300 animate-ping opacity-40" />
                        <button
                            onClick={stopRecording}
                            className="relative w-20 h-20 rounded-full bg-rose-500 text-white text-2xl shadow-lg shadow-rose-300 flex items-center justify-center"
                            aria-label="Stop recording"
                        >
                            ⏹️
                        </button>
                    </div>
                    <p className="text-rose-400 text-sm font-medium animate-pulse">
                        Listening...
                    </p>
                    <p className="text-stone-400 text-xs">Tap to stop when you&apos;re done</p>
                </div>
            )}

            {/* Transcribing */}
            {isTranscribing && (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl animate-pulse">
                        🐱
                    </div>
                    <p className="text-stone-500 text-sm">
                        The Cheshire Cat is listening...
                    </p>
                </div>
            )}

            {!isRecording && !isTranscribing && (
                <p className="text-stone-400 text-xs">Tap the mic to begin</p>
            )}

            {error && <p className="text-rose-400 text-xs">{error}</p>}
        </div>
    );
}
