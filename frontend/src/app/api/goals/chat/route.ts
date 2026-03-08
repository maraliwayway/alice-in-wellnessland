import { NextRequest, NextResponse } from "next/server";
import { generateChatContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { messages, goalsContext } = await req.json();

    // Prepend a system-style context turn before the real conversation
    const fullMessages: { role: "user" | "model"; text: string }[] = [
      {
        role: "user",
        text: `You are a wellness and goal achievement coach in the Alice in Wellnessland app. Be warm, encouraging, and practical. Provide specific, actionable advice. When recommending resources, include specific names of books, apps, courses, or websites.\n\n${goalsContext}`,
      },
      {
        role: "model",
        text: "Understood! I have your goal context. How can I help you today?",
      },
      ...(messages as { role: "user" | "model"; text: string }[]),
    ];

    const reply = await generateChatContent(fullMessages);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}