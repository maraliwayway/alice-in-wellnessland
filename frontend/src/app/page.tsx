import { JournalAnalyzer } from "@/components/JournalAnalyzer";

export default function Home() {
    return (
        <main className="p-10">
            <h1 className="text-2xl font-bold mb-6">
                Wellness Journal Analyzer
            </h1>

            <JournalAnalyzer />
        </main>
    );
}