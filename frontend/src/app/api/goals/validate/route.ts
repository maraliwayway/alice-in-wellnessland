import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { overview, strategies, criteriaLines } = await req.json();

    const prompt = `You are a SMART goal coach. Evaluate the following goal submission and respond ONLY in valid JSON with this exact structure:
{
  "isSmartGoal": true or false,
  "isCriteriaSpecific": true or false,
  "feedback": "A brief explanation of issues or confirmation it's valid. Keep it under 3 sentences."
}

Goal Overview: ${overview}

Strategies: ${strategies}

Acceptance Criteria:
${(criteriaLines as string[]).map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}

A SMART goal is Specific, Measurable, Achievable, Relevant, and Time-bound. The acceptance criteria must be specific and measurable checkboxes that confirm goal completion.`;

    const raw = await generateContent(prompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid response format from Gemini." },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}