import JournalEntry from "@/components/JournalEntry";
import JournalCard from "@/components/JournalCard";

interface JournalEntryDoc {
    _id: string;
    content: string;
    mood: string;
    moodScore: number;
    validation: string;
    affirmation: string;
    moodRating: number | null;
    createdAt: string;
}

async function getEntries(): Promise<JournalEntryDoc[]> {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/journal?userId=demo-user`,
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const data = (await res.json()) as { entries: JournalEntryDoc[] };
        return data.entries ?? [];
    } catch {
        return [];
    }
}

export default async function TeaPartyPage() {
    const entries = await getEntries();

    return (
        <main
            className="min-h-screen p-6 md:p-12 bg-stone-50"
            style={{
                backgroundImage:
                    "radial-gradient(circle, #e7e5e4 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            }}
        >
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <p className="text-5xl mb-2">🍵</p>
                    <h1 className="text-3xl font-bold text-stone-800 mb-1">
                        Mad Hatter&apos;s Tea Party
                    </h1>
                    <p className="text-stone-500 text-sm mb-1">
                        A space to breathe, reflect, and find clarity.
                    </p>
                    <p className="text-stone-400 text-xs">
                        Your thoughts are safe here.
                    </p>
                </header>

                {/* Divider */}
                <div className="h-px bg-stone-200 mb-8" />

                {/* Journal entry form */}
                <JournalEntry userId="demo-user" />

                {/* Past entries */}
                <section className="mt-10">
                    <h2 className="text-lg font-semibold text-stone-700 mb-4">
                        Your Story So Far
                    </h2>

                    {entries.length === 0 ? (
                        <p className="text-center text-stone-400 text-sm py-8">
                            Your story is just beginning... ☕
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {entries.map((entry) => (
                                <JournalCard key={entry._id} entry={entry} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
