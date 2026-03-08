import { NextRequest, NextResponse } from "next/server";
import { getGeminiFlash } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioEntry = formData.get("audio");
    if (!(audioEntry instanceof File)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }
    const audio = audioEntry;

    const buffer = Buffer.from(await audio.arrayBuffer());
    const base64 = buffer.toString("base64");

    const genAI = await getGeminiFlash();
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            mimeType: audio.type || "audio/webm",
            data: base64,
          },
        },
        "Transcribe this voice journal entry exactly as spoken. Return only the transcribed text, no labels, no punctuation fixes, just what was said.",
      ],
    });

    return NextResponse.json({ transcript: (result.text ?? "").trim() });
  } catch (error) {
    console.error("POST /api/transcribe error:", error);
    return NextResponse.json(
      { error: "Could not transcribe audio" },
      { status: 500 }
    );
  }
}
