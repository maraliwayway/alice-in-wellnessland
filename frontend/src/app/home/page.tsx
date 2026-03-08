"use client";

import Link from "next/link";

/* ── Playing-card data ───────────────────────────────── */
const cards = [
  { suit: "♠", rank: "A", label: "Journal",      href: "/tea-party",  color: "#1a1a2e", bg: "/journalbg.jpg", hideSuit: true },
  { suit: "♥", rank: "K", label: "Cheshire Chat", href: "/dashboard", color: "#1a1a2e", bg: "/dashboardbg.svg", bgColor: "#d4a0b0", hideSuit: true },
  { suit: "♦", rank: "Q", label: "Looking Glass", href: "/goals", color: "#1a1a2e", hideSuit: true, centerImg: "/goalsbg.jpg" },
];

export default function HomePage() {
  return (
    <main className="home-root">
      {/* ── SVG background ─────────────────────────────── */}
      <img src="/homebg.svg" alt="" aria-hidden className="home-bg-img" />

      {/* ── Welcome text ────────────────────────────────── */}
      <h1
        style={{
          fontFamily: "var(--font-alice), serif",
          fontSize: "3.5rem",
          fontWeight: 700,
          color: "#1a1a2e",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
          marginBottom: "2rem",
        }}
      >
        Welcome To Alice's Wellnessland!
      </h1>
      {/* ── Playing cards ──────────────────────────────── */}
      <div className="home-cards-area">
        {cards.map((c) => (
          <Link
            key={c.suit}
            href={c.href}
            className="playing-card"
            style={{
              position: "relative",
              overflow: "hidden",
              backgroundColor: c.bgColor || undefined,
            }}
          >
            {/* Optional card background image */}
            {c.bg && (
              <img
                src={c.bg}
                alt=""
                aria-hidden
                style={{
                  position: "absolute",
                  ...(c.bgColor
                    ? {
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "30% center",
                        opacity: 1,
                        filter: "brightness(1.15) saturate(1.1)",
                      }
                    : {
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 1,
                        filter: "brightness(1.1) saturate(1.05)",
                      }),
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}

            {/* Centre image (e.g. hourglass) */}
            {c.centerImg && (
              <img
                src={c.centerImg}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  opacity: 0.9,
                  filter: "brightness(1.1) saturate(1.05)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* ── Subtext below cards ──────────────────────────── */}
      <p
        style={{
          fontFamily: "var(--font-alice), serif",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#1a1a2e",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
          marginTop: "0.75rem",
        }}
      >
        Pick your adventure
      </p>
    </main>
  );
}
