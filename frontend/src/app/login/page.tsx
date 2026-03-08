"use client";

import Image from "next/image";
import { IM_Fell_English } from "next/font/google";
import { SignInButton } from "@clerk/nextjs";

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-im-fell",
});

export default function LoginPage() {
  return (
    <main className={`${imFell.variable} login-root`} style={{ fontFamily: "var(--font-im-fell), 'IM Fell English', serif" }}>

      {/* ── Centered keyhole image ──────────────────────────── */}
      <div className="login-keyhole">
        <Image
          src="/Untitled_design-4.png"
          alt="Keyhole to Wonderland"
          width={700}
          height={1000}
          className="login-keyhole-img"
          priority
        />
      </div>

      {/* ── Login button ───────────────────────────────────── */}
      <SignInButton mode="modal">
        <button className="login-btn">Login</button>
      </SignInButton>
    </main>
  );
}