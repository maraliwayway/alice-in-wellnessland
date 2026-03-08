"use client";

interface MoodRatingProps {
    value: number | null;
    onChange: (v: number) => void;
}

const MOOD_EMOJIS: Record<number, string> = {
    1: "😔",
    2: "😟",
    3: "😐",
    4: "🙂",
    5: "😊",
};

export default function MoodRating({ value, onChange }: MoodRatingProps) {
    return (
        <div className="flex gap-3">
            {([1, 2, 3, 4, 5] as const).map((rating) => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    aria-label={`Mood rating ${rating}`}
                    className={`rounded-full p-2 text-2xl transition-all duration-200 ${value === rating
                            ? "scale-125 ring-2 ring-rose-400 ring-offset-2"
                            : "opacity-50 hover:opacity-80"
                        }`}
                >
                    {MOOD_EMOJIS[rating]}
                </button>
            ))}
        </div>
    );
}
