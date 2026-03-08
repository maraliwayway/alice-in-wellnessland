import { NextRequest, NextResponse } from "next/server";
import { analyzeJournalEntry, getEmbedding } from "@/lib/gemini";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface JournalDocument {
    _id?: ObjectId;
    userId: string;
    content: string;
    moodRating: number | null;
    mood: string;
    moodScore: number;
    validation: string;
    clarity: string;
    affirmation: string;
    embedding: number[];
    createdAt: Date;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            userId: string;
            content: string;
            moodRating?: number;
        };

        const { userId, content, moodRating } = body;

        if (!userId || !content) {
            return NextResponse.json(
                { error: "userId and content are required" },
                { status: 400 }
            );
        }

        // Run AI analysis and embedding in parallel
        const [analysis, embedding] = await Promise.all([
            analyzeJournalEntry(content),
            getEmbedding(content),
        ]);

        const { db } = await connectToDatabase();

        const doc: Omit<JournalDocument, "_id"> = {
            userId,
            content,
            moodRating: moodRating ?? null,
            mood: analysis.mood,
            moodScore: analysis.moodScore,
            validation: analysis.validation,
            clarity: analysis.clarity,
            affirmation: analysis.affirmation,
            embedding,
            createdAt: new Date(),
        };

        const result = await db.collection<Omit<JournalDocument, "_id">>("journals").insertOne(doc);

        return NextResponse.json({
            success: true,
            entry: {
                id: result.insertedId.toString(),
                mood: analysis.mood,
                moodScore: analysis.moodScore,
                validation: analysis.validation,
                clarity: analysis.clarity,
                affirmation: analysis.affirmation,
                createdAt: doc.createdAt,
            },
        });
    } catch (error) {
        console.error("POST /api/journal error:", error);
        return NextResponse.json(
            { error: "Failed to create journal entry" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId query param is required" },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        const entries = await db
            .collection<JournalDocument>("journals")
            .find({ userId }, { projection: { embedding: 0 } })
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        return NextResponse.json({ entries });
    } catch (error) {
        console.error("GET /api/journal error:", error);
        return NextResponse.json(
            { error: "Failed to fetch journal entries" },
            { status: 500 }
        );
    }
}
