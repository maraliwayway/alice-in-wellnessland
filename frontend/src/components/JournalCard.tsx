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
  1: "😔", 2: "😟", 3: "😐", 4: "🙂", 5: "😊",
};

function getMoodEmoji(mood: string): string {
  const lower = mood.toLowerCase();
  if (["overwhelmed", "stressed", "anxious"].includes(lower)) return "🌀";
  if (["sad", "down", "depressed"].includes(lower))           return "🌧️";
  if (["happy", "excited", "great"].includes(lower))          return "✨";
  if (["confused", "lost", "unclear"].includes(lower))        return "🤔";
  if (["tired", "exhausted"].includes(lower))                 return "💤";
  if (["grateful", "good", "okay"].includes(lower))           return "🌸";
  return "🫖";
}

function getMoodScoreStyle(score: number): string {
  if (score >= 7) return "bg-emerald-950/55 text-emerald-400 border border-emerald-800/40";
  if (score >= 4) return "bg-amber-950/55 text-amber-400 border border-amber-800/40";
  return "bg-rose-950/55 text-rose-400 border border-rose-800/40";
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

interface JournalCardProps { entry: JournalEntry }

export default function JournalCard({ entry }: JournalCardProps) {
  const emoji      = getMoodEmoji(entry.mood);
  const moodLabel  = entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);
  const scoreStyle = getMoodScoreStyle(entry.moodScore);
  const preview    = entry.content.length > 150
    ? entry.content.slice(0, 150) + "..."
    : entry.content;

  return (
    <div
      className="rounded-2xl p-5 border transition-all duration-300 hover:border-teal-600/40 hover:shadow-lg"
      style={{ background: "rgba(8,55,70,0.48)", backdropFilter: "blur(12px)", borderColor: "rgba(100,200,180,0.22)" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-[#b8d8cc] text-sm font-medium">{moodLabel}</span>
          {entry.moodRating != null && (
            <span className="text-lg ml-1">{MOOD_EMOJIS_MAP[entry.moodRating]}</span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreStyle}`}>
          {entry.moodScore}/10
        </span>
      </div>

      {/* Date */}
      <p className="text-[#6ab8a8] text-xs mt-1">{formatDate(entry.createdAt)}</p>

      {/* Content preview */}
      <p className="text-[#8abcb0] text-sm mt-2 leading-relaxed">{preview}</p>

      {/* Affirmation */}
      {entry.affirmation && (
        <p className="italic text-[#3a7868] text-xs mt-2">
          🐱 {entry.affirmation}
        </p>
      )}
    </div>
  );
}
