"use client";
import { SignIn } from "@clerk/nextjs";

export default function PassageAuth() {
  return (
    <div className="w-full">
      <SignIn
        routing="hash"
        appearance={{
          variables: {
            colorBackground:     "transparent",
            colorPrimary:        "#a8c23a",
            colorText:           "#f0ebe0",
            colorTextSecondary:  "#8a8470",
            colorInputBackground:"rgba(255,255,255,0.08)",
            colorInputText:      "#f0ebe0",
            colorNeutral:        "#a8a090",
            borderRadius:        "2px",
            fontFamily:          "var(--font-im-fell), 'IM Fell English', serif",
          },
          elements: {
            card:    { boxShadow: "none", border: "none" },
            cardBox: { boxShadow: "none" },
            header:  { display: "none" },
            footer:  { background: "transparent" },
            footerActionLink: { color: "#a8c23a" },
          },
        }}
      />
    </div>
  );
}
