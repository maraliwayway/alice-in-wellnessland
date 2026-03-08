import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audio = formData.get("audio") as File;

        if (!audio) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await audio.arrayBuffer());
        const base64 = buffer.toString("base64");

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: audio.type || "audio/webm",
                                data: base64,
                            },
                        },
                        {
                            text: "Transcribe this voice journal entry exactly as spoken. Return only the transcribed text, no labels, no punctuation fixes, just what was said.",
                        },
                    ],
                },
            ],
        });

        return NextResponse.json({ transcript: (response.text ?? "").trim() });
    } catch (error) {
        console.error("POST /api/transcribe error:", error);
        return NextResponse.json(
            { error: "Could not transcribe audio" },
            { status: 500 }
        );
    }
}
