"use client";
import { useEffect, useState } from "react";

export default function PassageAuth() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Dynamically import the custom element when mounted
        import("@passageidentity/passage-elements/passage-auth").then(() => {
            setIsMounted(true);
        });
    }, []);

    if (!isMounted) return <div className="animate-pulse bg-zinc-800 rounded-lg h-96 w-full"></div>;

    return (
        <div className="w-full flex justify-center">
            {/* @ts-expect-error Custom element */}
            <passage-auth app-id={process.env.NEXT_PUBLIC_PASSAGE_APP_ID}></passage-auth>
        </div>
    );
}
