import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function GET() {
    try {
        // Basic test to see if we can generate content using the API key
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Respond with exactly: "Hello! The API key is working!"',
        });

        return NextResponse.json({
            success: true,
            message: response.text,
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate content. Please check your API key.' },
            { status: 500 }
        );
    }
}
