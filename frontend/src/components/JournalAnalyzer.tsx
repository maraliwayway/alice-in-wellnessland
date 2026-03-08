'use client';

import React, { useState } from 'react';

interface WellnessData {
    mood_score: number | null;
    activities: string[];
    emotions: string[];
    stressors: string[];
    social_interactions: string[];
    health_behaviors: string[];
}

interface ApiResponse {
    success: boolean;
    data?: WellnessData;
    error?: string;
}

export function JournalAnalyzer() {
    const [entry, setEntry] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WellnessData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entry.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/analyze-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry }),
            });

            const json: ApiResponse = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.error || 'Failed to analyze entry');
            }

            setResult(json.data || null);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Journal Analyzer</h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 mb-2">
                    How was your day? Write down your thoughts, feelings, and activities.
                </label>
                <textarea
                    id="journal-entry"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-y mb-4"
                    placeholder="I had a pretty good day today. I went for a 30 minute run..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !entry.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Entry'
                    )}
                </button>
            </form>

            {error && (
                <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {error}
                </div>
            )}

            {result && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Analysis Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Mood Score</p>
                            <p className="text-2xl font-bold text-blue-600 mb-4">{result.mood_score ? `${result.mood_score}/10` : 'N/A'}</p>

                            <p className="text-sm text-gray-500 font-medium my-1">Emotions</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {result.emotions.length > 0 ? result.emotions.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{item}</span>
                                )) : <span className="text-sm text-gray-400">None detected</span>}
                            </div>

                            <p className="text-sm text-gray-500 font-medium my-1">Stressors</p>
                            <div className="flex flex-wrap gap-1">
                                {result.stressors.length > 0 ? result.stressors.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{item}</span>
                                )) : <span className="text-sm text-gray-400">None detected</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 font-medium my-1">Activities</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {result.activities.length > 0 ? result.activities.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{item}</span>
                                )) : <span className="text-sm text-gray-400">None detected</span>}
                            </div>

                            <p className="text-sm text-gray-500 font-medium my-1">Social Interactions</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {result.social_interactions.length > 0 ? result.social_interactions.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">{item}</span>
                                )) : <span className="text-sm text-gray-400">None detected</span>}
                            </div>

                            <p className="text-sm text-gray-500 font-medium my-1">Health Behaviors</p>
                            <div className="flex flex-wrap gap-1">
                                {result.health_behaviors.length > 0 ? result.health_behaviors.map((item, i) => (
                                    <span key={i} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">{item}</span>
                                )) : <span className="text-sm text-gray-400">None detected</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-400 mb-1 font-mono">Raw JSON Payload:</p>
                        <pre className="text-xs bg-gray-800 text-gray-200 p-3 rounded overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
