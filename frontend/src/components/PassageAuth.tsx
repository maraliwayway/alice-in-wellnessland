"use client";

import { SignIn } from "@clerk/nextjs";

export default function PassageAuth() {
    return (
        <div className="w-full flex justify-center">
            <SignIn routing="hash" />
        </div>
    );
}
