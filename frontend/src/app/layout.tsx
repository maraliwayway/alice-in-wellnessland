import type { Metadata } from "next";
import { Geist, Geist_Mono, Alice } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const alice = Alice({
    variable: "--font-alice",
    weight: "400",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Alice in Wellnessland",
    description: "A voice-first AI wellness companion for co-op students navigating burnout and imposter syndrome.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider signInFallbackRedirectUrl="/home" signUpFallbackRedirectUrl="/home">
            <html lang="en">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} ${alice.variable} antialiased`}
                >
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
