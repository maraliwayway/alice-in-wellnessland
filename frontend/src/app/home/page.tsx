"use client";

import Link from "next/link";

/* ── Playing-card data ───────────────────────────────── */
const cards = [
  { suit: "♠", rank: "A", label: "Journal",      href: "/tea-party",  color: "#1a1a2e" },
  { suit: "♥", rank: "K", label: "Cheshire Chat", href: "/wonderland", color: "#1a1a2e" },
  { suit: "♦", rank: "Q", label: "Looking Glass", href: "/wonderland", color: "#1a1a2e" },
];

export default function HomePage() {
  return (
    <main className="home-root">
      {/* ── SVG background ─────────────────────────────── */}
      <img src="/homebg.svg" alt="" aria-hidden className="home-bg-img" />

      {/* ── Playing cards ──────────────────────────────── */}
      <div className="home-cards-area">
        {cards.map((c) => (
          <Link key={c.suit} href={c.href} className="playing-card">
            {/* Top-left corner */}
            <span className="card-corner card-corner-tl">
              <span className="card-rank" style={{ color: c.color }}>{c.rank}</span>
              <span className="card-suit-sm" style={{ color: c.color }}>{c.suit}</span>
            </span>

            {/* Centre */}
            <span className="card-center">
              <span className="card-suit-lg" style={{ color: c.color }}>{c.suit}</span>
            </span>

            {/* Bottom-right corner (upside-down) */}
            <span className="card-corner card-corner-br">
              <span className="card-rank" style={{ color: c.color }}>{c.rank}</span>
              <span className="card-suit-sm" style={{ color: c.color }}>{c.suit}</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
