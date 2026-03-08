import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const features = [
  { icon: "🐱", label: "Cheshire Cat", desc: "Voice AI companion" },
  { icon: "🍵", label: "Tea Party", desc: "Daily journal" },
  { icon: "🐇", label: "White Rabbit", desc: "Habit tracking" },
  { icon: "🪞", label: "Looking Glass", desc: "Mood history" },
];

// Precompute so CSS is valid — no runtime calc(var(--i)) needed
const rings = [
  { scale: 0.20, duration: "20s", reverse: false },
  { scale: 0.35, duration: "26s", reverse: true  },
  { scale: 0.50, duration: "34s", reverse: false },
  { scale: 0.65, duration: "44s", reverse: true  },
  { scale: 0.80, duration: "55s", reverse: false },
  { scale: 0.96, duration: "68s", reverse: true  },
];

const particleColors = ["#c084fc", "#f472b6", "#fbbf24", "#e879f9", "#a78bfa"];

const particles = Array.from({ length: 22 }, (_, i) => ({
  left:     `${(i * 4.6 + 3) % 94}%`,
  top:      `${(i * 7.3 + 5) % 90}%`,
  size:     i % 5 === 0 ? 4 : i % 3 === 0 ? 2 : 3,
  color:    particleColors[i % particleColors.length],
  twinkle:  `${2.5 + (i % 5) * 0.6}s`,
  float:    `${6  + (i % 7) * 0.8}s`,
  delay:    `${(i * 0.35) % 4}s`,
}));

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/home");
  return (
    <main className={`${cormorant.className} landing-root`}>
      {/* Animated background mesh */}
      <div className="mesh" aria-hidden />

      {/* Rabbit hole vortex */}
      <div className="vortex" aria-hidden>
        {rings.map((r, i) => (
          <div
            key={i}
            className="vortex-ring"
            style={{
              transform: `scale(${r.scale})`,
              animation: `vortex-spin ${r.duration} linear infinite`,
              animationDirection: r.reverse ? "reverse" : "normal",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="particles" aria-hidden>
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              animationDuration: `${p.twinkle}, ${p.float}`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="content">
        <p className="eyebrow">a wellness journey</p>

        <h1 className="title">
          Alice in<br />
          <em>Wellnessland</em>
        </h1>

        <p className="subtitle">
          Fall down the rabbit hole of self-discovery.<br />
          Your AI companion awaits on the other side.
        </p>

        <Link href="/login" className="cta">
          <span>Follow the White Rabbit</span>
          <span className="cta-arrow">↓</span>
        </Link>

        <div className="features">
          {features.map((f) => (
            <div key={f.label} className="feature-pill">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <div className="feature-name">{f.label}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
